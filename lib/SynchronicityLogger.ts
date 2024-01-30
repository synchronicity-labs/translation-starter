import { Logtail } from '@logtail/node';
import { Logger } from 'tslog';

const LOG_LEVEL = process.env.LOG_LEVEL;
const LOG_FORMAT = process.env.LOG_FORMAT;

enum LogLevel {
  Debug = 0,
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  Trace = 0,
  Info = 1,
  Warn = 2,
  Error = 3
}

const logtail = new Logtail(process.env.LOGTAIL_SOURCE_TOKEN as string);

export class SynchronicityLogger {
  private readonly logger: Logger<any>;
  private readonly format: 'pretty' | 'json';
  private name = 'SynchronicityLogger';

  private lastTimestamp: number | null = null;
  private readonly level: LogLevel;

  constructor({ name }: { name?: string }) {
    this.level = this.getLogLevel(LOG_LEVEL ? LOG_LEVEL : 'info');
    this.format = LOG_FORMAT ? (LOG_FORMAT as 'pretty' | 'json') : 'json';
    this.name = name ? name : this.name;

    this.logger = new Logger({
      name: this.name,
      type: this.format,
      overwrite: {
        transportJSON: (obj) =>
          SynchronicityLogger.transportJSON(obj, this.format)
      },
      argumentsArrayName: 'args'
    });

    this.logger.attachTransport((logObj) => {
      if (process.env.NODE_ENV !== 'production') {
        return;
      }
      const json = SynchronicityLogger.transportJSON(logObj, this.format);
      const { message, level, ...metadata } = json;
      logtail.log(message, level, metadata);
    });

    this.name = name ? name : this.name;
  }

  public setName(name: string) {
    this.name = name;
  }

  private getLogLevel(level: string): LogLevel {
    switch (level.toLowerCase()) {
      case 'debug':
      case 'trace':
        return LogLevel.Debug;
      case 'info':
        return LogLevel.Info;
      case 'warn':
        return LogLevel.Warn;
      case 'error':
        return LogLevel.Error;
      default:
        throw new Error(`Unknown log level: ${level}`);
    }
  }

  static transportJSON(logObj: any, type: 'pretty' | 'json') {
    const args: any[] = logObj.args;
    const metadata =
      typeof args[args.length - 1] === 'object' &&
      !Array.isArray(args[args.length - 1])
        ? args.pop()
        : {};
    const newLogObj = {
      message: args.join(' '),
      hostname: logObj._meta.hostname,
      name: logObj._meta.name,
      timestamp: logObj._meta.date,
      level: logObj._meta.logLevelName,
      pid: process.pid,
      metadata,
      environment: process.env.ENV_IDENTIFIER || 'unset'
    };

    if (type === 'json') {
      console.log(JSON.stringify(newLogObj));
    } else {
      console.log(newLogObj);
    }

    return newLogObj;
  }

  /**
   * Logs general information.
   * This method is typically used for informative messages that denote routine operations.
   * @param message - The main content of the log.
   * @param meta - Additional metadata for the log.
   */
  log(message: any, ...meta: any[]) {
    if (!this.shouldLog(this.level, LogLevel.Info)) {
      return;
    }
    this.logger.info(message, ...meta);
  }

  /**
   * Logs error messages.
   * This method is used to log error messages that occur during the application's execution.
   * @param message - Description of the error.
   * @param trace - Stack trace or error trace information.
   * @param meta - Additional metadata about the error.
   */
  error(message: any, ...meta: any[]) {
    if (!this.shouldLog(this.level, LogLevel.Error)) {
      return;
    }
    this.logger.info(message, ...meta);
  }

  /**
   * Logs warning messages.
   * Warning messages are typically used to log issues that aren’t critical but deserve attention.
   * @param message - Description of the warning.
   * @param meta - Additional metadata about the warning.
   */
  warn(message: any, ...meta: any[]) {
    if (!this.shouldLog(this.level, LogLevel.Warn)) {
      return;
    }
    this.logger.info(message, ...meta);
  }

  /**
   * Logs debug messages.
   * Debug messages provide detailed information during the development phase for debugging purposes.
   * @param message - Description of the debug information.
   * @param meta - Additional debug data.
   */
  debug(message: any, ...meta: any[]) {
    if (!this.shouldLog(this.level, LogLevel.Debug)) {
      return;
    }
    this.logger.info(message, ...meta);
  }

  /**
   * Logs verbose messages.
   * Verbose messages contain additional contextual information for understanding the flow through the system.
   * @param message - Description of the verbose information.
   * @param meta - Additional contextual data.
   */
  verbose(message: any, ...meta: any[]) {
    if (!this.shouldLog(this.level, LogLevel.Debug)) {
      return;
    }
    this.logger.info(message, ...meta);
  }

  private shouldLog(selectedLevel: LogLevel, messageLevel: LogLevel): boolean {
    return messageLevel >= selectedLevel;
  }

  /**
   * Logs the time elapsed since the last call to this method.
   */
  profile(message: string) {
    if (!this.shouldLog(this.level, LogLevel.Debug)) {
      return;
    }

    const currentTimestamp = Date.now();
    if (this.lastTimestamp !== null) {
      const timeSinceLastCall = currentTimestamp - this.lastTimestamp;
      this.debug(
        `${message} - Time since last profile call: ${timeSinceLastCall} ms`
      );
    } else {
      this.debug(`${message} - Profile started`);
    }
    this.lastTimestamp = currentTimestamp;
  }

  getSubLogger({ name }: { name: string }): SynchronicityLogger {
    const logger = new SynchronicityLogger({ name: `${this.name}|${name}` });
    return logger;
  }
}
