import FormData from 'form-data';
import fetch from 'node-fetch';
import * as fs from 'fs';
import * as child_process from 'child_process';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import { spawn } from 'child_process';
const path = require('path');
const os = require('os');
const axios = require('axios');
import ffmpeg from 'fluent-ffmpeg';




interface ChunkMetadata {
  startTime: number;
  endTime: number;
  filePath: string;
}

interface Element {
  speaker: number;
  time_begin: number;
  time_end: number;
  transcription: string;
}

interface SpeakerElement {
  time_begin: number;
  time_end: number;
  transcription: string;
}

const tempFolder = './temp'; // Adjust the path as needed
if (!fs.existsSync(tempFolder)) {
  fs.mkdirSync(tempFolder);
}

/*
Input:
speakerData: Array of all chunks corresponding to each speaker 
speakerIndex: Index of each speaker

Return:
chunkMetadata : Details of each chunk i.e. startTime,endTime, filePath
*/
async function createAudioChunks(speakerData: SpeakerElement[], speakerIndex: number, filePath: string): Promise<ChunkMetadata[]> {
  // Randomly select up to 20 sentences
  const selectedSentences = speakerData.length > 20
    ? speakerData.sort(() => 0.5 - Math.random()).slice(0, 20)
    : speakerData;

  const chunkMetadata: ChunkMetadata[] = [];
  console.log(speakerData, "#####################", selectedSentences);

  for (const sentence of selectedSentences) {
    const chunkFileName = `speaker_${speakerIndex}_${sentence.time_begin}-${sentence.time_end}hello.mp3`;
    const chunkFilePath = `${tempFolder}/${chunkFileName}`;

    // Use fluent-ffmpeg to create a chunk from the original audio file
    await new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input(filePath)
        .setStartTime(sentence.time_begin)
        .setDuration(sentence.time_end - sentence.time_begin)
        .audioCodec('copy')
        .on('end', () => {
          console.log('FFmpeg process finished.');
          resolve();
        })
        .on('error', (err) => {
          console.error('Error during FFmpeg processing:', err);
          reject(err);
        })
        .save(chunkFilePath);
    });

    console.log("executed ffmpeg", "#####################");

    chunkMetadata.push({
      startTime: sentence.time_begin,
      endTime: sentence.time_end,
      filePath: chunkFilePath
    });
  }

  console.log("executed create audio chunks", "#####################");
  return chunkMetadata;
}


async function downloadAudioFromUrl(url:string) {
  try {
    // Make an HTTP GET request to the audio URL
    const response = await axios.get(url, { responseType: 'arraybuffer' });

    // Convert the response data to a Buffer
    const audioBuffer = Buffer.from(response.data);

    return audioBuffer;
  } catch (error) {
    console.error('Error downloading audio from URL:', error);
    throw error;
  }
}

/*
Input:
Chunks: Array of all chunks corresponding to each speaker 
Id: Job ID of each speaker


Return:
responseData : 11Labs API response for each speaker
*/
async function trainModelForSpeaker(chunks: ChunkMetadata[], id: string): Promise<any> {
  const form = new FormData();

  // Set other fields like description, labels, and name as required
  form.append('name', `voice-${id}`);
  form.append('description', `Voice for job ${id}`);
  console.log(chunks, "#####################")
  // Append each audio file to the form
  chunks.forEach(chunk => {
    // Assuming the filePath points to an actual file
    console.log(chunk.filePath, "#####################]]]]]]]]]]]");
    form.append("files", fs.createReadStream(chunk.filePath));
  });
 console.log(form);
  try {
    const voiceClone = await fetch('https://api.elevenlabs.io/v1/voices/add', {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVEN_LABS_API_KEY as string
      },
      body: form
    });

    if (!voiceClone.ok) {
      const errorResponse = await voiceClone.text(); // Get the detailed error message
      console.error(
        `Failed to clone voice: ${voiceClone.status} ${voiceClone.statusText}`
      );
      console.error(`Error response body: ${errorResponse}`);
      throw new Error(
        `Eleven Labs API call failed with status: ${voiceClone.status}, body: ${errorResponse}`
      );
    }

    const data = await voiceClone.json();

  } catch (err) {
    console.error(err);
    throw err;
  }
}


export async function POST(req: Request) {
  console.log(req.method);
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', {
      headers: { Allow: 'POST' },
      status: 405
    });
  }

  const { id, audioUrl, transcript } = await req.json();

  try {
    const audioFile = await fetch(audioUrl);
    const newArray: SpeakerElement[][] = [];


    if (!audioFile.ok) {
      console.error(
        `Failed to fetch audio file: ${audioFile.status} ${audioFile.statusText}`
      );
      return new Response(JSON.stringify({ error: { statusCode: 500 } }), {
        status: 500
      });
    }
    const prediction = transcript;
    const audioBuffer = await downloadAudioFromUrl(audioUrl);
    const uuid = uuidv4();
    const filename = 'audio_' + uuid + '.mp3';

    // Get the path to the temporary folder in the home directory
    const tempFolderPath = path.join(os.homedir(), 'temp');

    // Create the temp folder if it doesn't exist
    if (!fs.existsSync(tempFolderPath)) {
      fs.mkdirSync(tempFolderPath);
    }

    // Build the full path to the audio file in the temp folder
    const filePath = path.join(tempFolderPath, filename);

    // Write the audio data to the file
    await fs.promises.writeFile(filePath, audioBuffer);
    console.log(filePath,"##################### file written")

    prediction.forEach((element: Element) => {
      // your code here
      const speakerIndex = element.speaker;

      // Initialize the array for this speaker if it doesn't exist
      if (!newArray[speakerIndex]) {
        newArray[speakerIndex] = [];
      }

      // Add the relevant data to the speaker's array
      newArray[speakerIndex].push({
        time_begin: element.time_begin,
        time_end: element.time_end,
        transcription: element.transcription
      });
    });
    console.log(newArray);

    const allChunkMetadata: ChunkMetadata[][] = [];


    for (let i = 0; i < newArray.length; i++) {
      const speakerChunks = await createAudioChunks(newArray[i], i, filePath);
      console.log("executed create audio chunks","///////////#####################")
      allChunkMetadata.push(speakerChunks);
    }
    console.log("executed create audio chunks","#####################")
    // allChunkMetadata now contains the metadata for all chunks
    console.log(allChunkMetadata);
    let modelTrainingResponses = [];
    modelTrainingResponses.push("21m00Tcm4TlvDq8ikWAM");
    // for (const speakerChunks of allChunkMetadata) {
    //   const response = await trainModelForSpeaker(speakerChunks, id);
    //   modelTrainingResponses.push(response);
    // }
    console.log("executed trainModel","#####################")
    return new Response(JSON.stringify({ modelTrainingResponses }), {
      status: 200
    });
  } catch (error) {
    console.error(`Failed to clone voice: `, error);
    return new Response(JSON.stringify({ error: { statusCode: 500 } }), {
      status: 500
    });
  }
}
