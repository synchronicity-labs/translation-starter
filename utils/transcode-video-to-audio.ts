// imports
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

function getFileExtension(file_name: string) {
  const regex = /(?:\.([^.]+))?$/; // Matches the last dot and everything after it
  const match = regex.exec(file_name);
  if (match && match[1]) {
    return match[1];
  }
  return ''; // No file extension found
}

function removeFileExtension(file_name: string) {
  const lastDotIndex = file_name.lastIndexOf('.');
  if (lastDotIndex !== -1) {
    return file_name.slice(0, lastDotIndex);
  }
  return file_name; // No file extension found
}

export default async function transcodeVideoToAudio(
  ffmpeg: FFmpeg,
  videoInput: File | string
): Promise<any> {
  console.log('videoInput: ', videoInput);
  const isFile = videoInput instanceof File;
  const fileName = isFile
    ? videoInput.name
    : videoInput.split('/').pop() ?? 'output';

  const input = getFileExtension(fileName);
  const output = removeFileExtension(fileName) + '.mp3';

  console.log('transcodeVideoToAudio - input: ', input);
  console.log('transcodeVideoToAudio - output: ', output);
  ffmpeg.writeFile(input, await fetchFile(videoInput));

  const ffmpeg_cmd = ['-i', input, output];

  // execute cmd
  await ffmpeg.exec(ffmpeg_cmd);

  const data = (await ffmpeg.readFile(output)) as any;
  console.log('transcodeVideoToAudio - data: ', data);
  const blob = new Blob([data], { type: 'audio/mp3' });
  return { blob, output };
}
