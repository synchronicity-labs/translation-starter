export const isYoutubeUrlRegex = `^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|channel\/|user\/|playlist\?list=|shorts\/)?([a-zA-Z0-9_-]+)`;

export function checkIfValidYoutubeUrl(url: string) {
  return url.match(isYoutubeUrlRegex) !== null;
}
