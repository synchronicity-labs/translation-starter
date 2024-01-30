import { exists } from '@/utils/helpers';
import supabase from '@/utils/supabase';
import { createWriteStream, promises as fsPromises, readFileSync } from 'fs';
import fetch from 'node-fetch';
import os from 'os';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
const { spawn } = require('child_process');
import {exec}  from 'child_process';
import { get } from 'http';
interface AudioSection {
  startTime: number;
  duration: number;
  filePath: string;
}

/*
input:
originalAudioPath: The orginial audio that was generated to overlay
originalAudioPath: Details of the chunk that need to be replaced

output
*/
async function replaceAudioSection(originalAudioPath: string, newAudioSection: AudioSection):  Promise<void> {
    const { startTime, duration, filePath } = newAudioSection;
    const tempDir =
    process.env.NEXT_PUBLIC_SITE_URL !== 'http://localhost:3000'
      ? os.tmpdir()
      : path.resolve('./temp');

    
    const tempFilePath = path.join(tempDir, `Processed-audio.mp3`);
    try {
      await ffmpeg()
        .input(originalAudioPath)
        .input(filePath)
        .complexFilter([
          `[0:a]atrim=end=${startTime}[audio1]`, // Trim original audio up to the start time
          `[1:a]atrim=start=0:end=${duration}[audio2]`, // Trim new audio from the beginning up to the specified duration
          `[audio1][audio2]concat=n=2:v=0:a=1[out]`, // Concatenate the two audio streams
        ])
        .map('[out]')
        .audioCodec('aac')
        .output(tempFilePath)
        .on('end', async () => {
          try {
            // Replace the original file with the temporary file
            // await fsPromises.rename(tempFilePath, originalAudioPath);
            console.log('Audio section replaced successfully.');
          } catch (error) {
            console.error('Failed to replace audio section:', error);
          }
        })
        .on('error', async (err) => {
          // Remove the temporary file in case of an error
          try {
            // await fsPromises.unlink(tempFilePath); // Remove the temporary file
          } catch (error) {
            // Ignore errors if the file doesn't exist
          }
          console.error('Failed to replace audio section:', err);
        })
        .run();
    } catch (error) {
      console.error('Failed to replace audio section:', error);
    }
  };


async function insertChunk(audioPath: string, timeStart: number, duration: number, chunkPath: string): Promise<void> {
  const timeEnd = timeStart + duration;
  const command = `ffmpeg -i ${audioPath} -i ${chunkPath} -filter_complex "[0:a]atrim=${timeStart}:${timeEnd},asetpts=N/SR/TB[a];[1:a]asetpts=N/SR/TB[b];[a][b]concat=n=2:v=0:a=1[outa]" -map "[outa]" ${audioPath}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    console.log('Audio chunk inserted successfully!');
  });
}


/*
input:
filePath: The orginial audio that was generated to overlay

output:
duration: The duration of the audio in seconds
*/

function getAudioDuration(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }

      const duration = metadata.format.duration;
      resolve(duration || 0);
    });
  });
}

/*
input:
voiceId: The voiceId to use for the text to speech
text: Text-to-speech
start: The start time in seconds
blankAudioPath: The path to the blank audio file

output:


*/
async function fetchAudioFrom11Labs(voiceId: string, text: string, start: number ,apiKey:string, blankAudioPath: string): Promise<string> {
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId || "9F4C8ztpNUmXkdDDbz3J"}`, {
    method: 'POST',
    headers: {
      accept: 'audio.mpeg',
      'content-type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.5,
        use_speaker_boost: true,
      },
    }),
  });
  console.log(response);
  if (!response.ok || !response.body) {
    const errorText = await response.text();
    console.error(`Failed to convert text to speech`);
    throw new Error(`Failed to fetch audio from 11Labs`);
  }
  const data = response.body;


  const uuid = uuidv4();

  const tempDir =
    process.env.NEXT_PUBLIC_SITE_URL !== 'http://localhost:3000'
      ? os.tmpdir()
      : path.resolve('./temp');

  await fsPromises.mkdir(tempDir, { recursive: true });
  const tempFilePath = path.join(tempDir, `elevenLabs-${uuid}.mp3`);
  const fileStream = createWriteStream(tempFilePath);

  for await (const chunk of data) {
    fileStream.write(chunk);
  }
  fileStream.end();
 console.log(getAudioDuration(tempFilePath),"(((((((((((((((((((((((",getAudioDuration(blankAudioPath));
  console.log("audio fetched from 11labs", tempFilePath);
  const duration = await getAudioDuration(tempFilePath);
  await replaceAudioSection(blankAudioPath, {
    startTime: start,
    duration,
    filePath: tempFilePath,
  });
  // return pathFile;
  console.log(duration,"(((((((((((((((((((((((", tempFilePath)
  await insertChunk(blankAudioPath, start, duration, tempFilePath);
  return tempFilePath;
}

/*
input: 
origionalAudioUrl: original audio that contains actual audio of video
outputPath:path to which audio needs to be stored

output:


*/
async function getAudioDurationFromUrl(url: string): Promise<number> {
  return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(url, (err, metadata) => {
          if (err) {
              reject(err);
              return;
          }
          const duration = metadata.format.duration;
          resolve(duration || 0);
      });
  });
}

async function createBlankAudio(durationInSeconds: Number, outputPath: string): Promise<void> {
    const ffmpegProcess = spawn('ffmpeg', [
      '-f', 'lavfi',
      '-i', `anullsrc=r=44100:cl=stereo`,
      '-t', durationInSeconds,
      outputPath,
    ]);
}

export async function POST(req: Request) {
  // Ensure the API key is set
  console.log("Synthesis started");
  const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
  if (!elevenLabsApiKey) {
    return new Response(
      JSON.stringify({
        error: { statusCode: 500, message: 'Server configuration error' }
      }),
      { status: 500 }
    );
  }

  // Ensure the method is POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        error: { statusCode: 405, message: 'Method Not Allowed' }
      }),
      { status: 405 }
    );
  }

  const { transcript, voiceId, originalAudioUrl } = await req.json(); 
  let voiceID = voiceId.modelTrainingResponses
  console.log(voiceID,"####################");
  // Check if the values exist
  // if (!exists(transcript) || !exists(voiceId)) {
  //   return new Response(
  //     JSON.stringify({
  //       error: {
  //         statusCode: 400,
  //         message: 'Missing text or voiceId in the request body.'
  //       }
  //     }),
  //     { status: 400 }
  //   );
  // }

  try {  
    const uuid = uuidv4();

    const tempDir =
      process.env.NEXT_PUBLIC_SITE_URL !== 'http://localhost:3000'
        ? os.tmpdir()
        : path.resolve('./temp');

    await fsPromises.mkdir(tempDir, { recursive: true });
    let tempFilePath = path.join(tempDir, `blankAudio-${uuid}.mp3`);
    console.log("hello");
    try {
      await fsPromises.access(tempDir);
    } catch (error) {
      await fsPromises.mkdir(tempDir);
    }
    console.log("hello check done");
    const duration = await getAudioDurationFromUrl(originalAudioUrl);
    console.log(duration,"83204830248024803840",duration);

    // Create a blank audio file
    await createBlankAudio(duration+0.2, tempFilePath);
    console.log("blank audio created","##############",tempFilePath);

    for (const element of transcript) {
      const { time_begin, speaker, transcription } = element;
      console.log(voiceID[speaker],"####################");
      await fetchAudioFrom11Labs(voiceID[speaker], transcription, time_begin, elevenLabsApiKey, tempFilePath);
    }
    console.log("audio fetched from 11labs")
    
    const fileStream = createWriteStream(tempFilePath);
    console.log("file stream created","###########################");
    fileStream.end();
    const url = await new Promise<string>(async (resolve, reject) => {
      fileStream.on('finish', async function () {
        try {
          const audioData = readFileSync(tempFilePath);
          console.log(tempFilePath, '###########################');
    
          const filePath = `public/output-audio-${Date.now()}.mp3`;
          const { data, error } = await supabase.storage
            .from('translation')
            .upload(filePath, audioData, {
              contentType: 'audio/mp3',
              upsert: false,
            });
    
          if (error) {
            console.error('Error uploading audio to Supabase:', error);
            reject(error);
          }
    
          if (!data) {
            console.error('No data returned from Supabase');
            reject('No data returned from Supabase');
          }
    
          const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/translation/${data!.path}`;
    
          // Resolve the promise with the URL
          resolve(url);
        } catch (error) {
          console.error('Error uploading audio to Supabase:', error);
          reject(error);
        }
      });
    
      // Handle the 'error' event of the fileStream
      fileStream.on('error', (error) => {
        console.error('File stream error:', error);
        reject(error);
      });
    });
    console.log("audio uploaded to supabase", url);
    // Clean up temp files and directory
    // await fsPromises.unlink(tempFilePath);

    return new Response(JSON.stringify({ data: url }), {
      status: 200
    });
  } catch (error) {
    console.error(`Failed to convert text to speech: `, error);
    return new Response(JSON.stringify({ error: { statusCode: 500 } }), {
      status: 500,
      statusText: `Failed to convert text to speech`
    });
  }
}
