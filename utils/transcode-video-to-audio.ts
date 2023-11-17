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
  videoFile: File
): Promise<any> {
  const input = getFileExtension(videoFile.name);
  const output = removeFileExtension(videoFile.name) + '.mp3';
  ffmpeg.writeFile(input, await fetchFile(videoFile));

  const ffmpeg_cmd = ['-i', input, output];

  // execute cmd
  await ffmpeg.exec(ffmpeg_cmd);

  const data = (await ffmpeg.readFile(output)) as any;
  console.log('transcodeVideoToAudio - data: ', data);
  const blob = new Blob([data], { type: 'audio/mp3' });
  const url = URL.createObjectURL(blob);
  console.log('url ', url);
  return { blob, output };
}
