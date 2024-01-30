import { Inngest } from 'inngest';

const CLIENT_ID = process.env.INNGEST_CLIENT_ID;

if (!CLIENT_ID) {
  throw new Error('Missing INNGEST_CLIENT_ID environment variable');
}

// Create a client to send and receive events
export const inngest = new Inngest({ id: CLIENT_ID });
