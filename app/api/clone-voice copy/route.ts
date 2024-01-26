import FormData from 'form-data';
import fetch from 'node-fetch';
import * as fs from 'fs';
import * as child_process from 'child_process';
import { promisify } from 'util';

const exec = promisify(child_process.exec);

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

async function createAudioChunks(speakerData: SpeakerElement[], speakerIndex: number): Promise<ChunkMetadata[]> {
  // Randomly select up to 20 sentences
  const selectedSentences = speakerData.length > 20 
      ? speakerData.sort(() => 0.5 - Math.random()).slice(0, 20)
      : speakerData;

  const chunkMetadata: ChunkMetadata[] = [];

  for (const sentence of selectedSentences) {
      const chunkFileName = `speaker_${speakerIndex}_${sentence.time_begin}-${sentence.time_end}.mp3`;
      const chunkFilePath = `${tempFolder}/${chunkFileName}`;

      // Use ffmpeg to create a chunk from the original audio file
      const command = `ffmpeg -i your_audio_file.mp3 -ss ${sentence.time_begin} -to ${sentence.time_end} -c copy ${chunkFilePath}`;
      await exec(command);

      chunkMetadata.push({
          startTime: sentence.time_begin,
          endTime: sentence.time_end,
          filePath: chunkFilePath
      });
  }

  return chunkMetadata;
}


export async function POST(req: Request) {
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

    const allChunkMetadata: ChunkMetadata[][] = [];

    for (let i = 0; i < newArray.length; i++) {
      const speakerChunks = await createAudioChunks(newArray[i], i);
      allChunkMetadata.push(speakerChunks);
  }

  // allChunkMetadata now contains the metadata for all chunks
  console.log(allChunkMetadata);




    // const formData = new FormData();
    // formData.append('name', `voice-${id}`);
    // formData.append('description', `Voice for job ${id}`);
    // formData.append('files', audioFile.body, {
    //   filename: `voice-${id}.mp3`,
    //   contentType: 'audio/mp3'
    // });

    // const voiceClone = await fetch('https://api.elevenlabs.io/v1/voices/add', {
    //   method: 'POST',
    //   headers: {
    //     'xi-api-key': process.env.ELEVEN_LABS_API_KEY as string
    //   },
    //   body: formData
    // });

    // if (!voiceClone.ok) {
    //   const errorResponse = await voiceClone.text(); // Get the detailed error message
    //   console.error(
    //     `Failed to clone voice: ${voiceClone.status} ${voiceClone.statusText}`
    //   );
    //   console.error(`Error response body: ${errorResponse}`);
    //   throw new Error(
    //     `Eleven Labs API call failed with status: ${voiceClone.status}, body: ${errorResponse}`
    //   );
    // }

    // const data = await voiceClone.json();

    // return new Response(JSON.stringify({ data }), {
    //   status: 200
    // });
  } catch (error) {
    console.error(`Failed to clone voice: `, error);
    return new Response(JSON.stringify({ error: { statusCode: 500 } }), {
      status: 500
    });
  }
}
