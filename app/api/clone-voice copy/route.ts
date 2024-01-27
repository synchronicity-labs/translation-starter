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


/*
Input:
speakerData: Array of all chunks corresponding to each speaker 
speakerIndex: Index of each speaker

Return:
chunkMetadata : Details of each chunk i.e. startTime,endTime, filePath
*/
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

  // Append each audio file to the form
  chunks.forEach(chunk => {
    // Assuming the filePath points to an actual file
    form.append("files", fs.createReadStream(chunk.filePath));
  });

  const options = {
    method: 'POST',
    body: form,
    // Note: 'Content-Type' should not be set manually when using FormData
  };

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices/add', options);
    const responseData = await response.json();
    return responseData;
  } catch (err) {
    console.error(err);
    throw err;
  }
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
      if (!allChunkMetadata[i]) {
        allChunkMetadata[i] = [];
      }
      const speakerChunks = await createAudioChunks(newArray[i], i);
      allChunkMetadata.push(speakerChunks);
    }

    // allChunkMetadata now contains the metadata for all chunks
    console.log(allChunkMetadata);
    let modelTrainingResponses = [];

    for (const speakerChunks of allChunkMetadata) {
      const response = await trainModelForSpeaker(speakerChunks, id);
      modelTrainingResponses.push(response);
    }
    
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
