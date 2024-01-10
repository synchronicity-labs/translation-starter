import { Price } from '@/types/db';

export const getURL = () => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    'http://localhost:3000/';
  // Make sure to include `https://` when not localhost.
  url = url.includes('http') ? url : `https://${url}`;
  // Make sure to including trailing `/`.
  url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;
  return url;
};

export const postData = async ({
  url,
  data
}: {
  url: string;
  data?: { price: Price };
}) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    credentials: 'same-origin',
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    console.log('Error in postData', { url, data, res });

    throw Error(res.statusText);
  }

  return res.json();
};

export const toDateTime = (secs: number) => {
  var t = new Date('1970-01-01T00:30:00Z'); // Unix epoch start.
  t.setSeconds(secs);
  return t;
};

export const insertBeforeDot = (url: string, insert: string) => {
  const dotIndex = url.lastIndexOf('.');
  if (dotIndex === -1) return url + insert; // If there's no dot, just append the UUID.

  const beginning = url.substring(0, dotIndex);
  const ending = url.substring(dotIndex);

  return beginning + '-' + insert + ending;
};

export const replaceFileExtension = (
  filename: string,
  newExtension: string
): string => {
  // This will remove the original extension and add the new extension
  return filename.replace(/\.[^/.]+$/, '') + newExtension;
};

export const sortByCreatedAt = (array: any[]) => {
  return array.sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);

    return dateB.getTime() - dateA.getTime();
  });
};

export const removeEdgeParentheses = (s: string): string => {
  return s.replace(/^\(|\)$/g, '');
};

export const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const exists = (value: any) => {
  return value !== undefined && value !== null && value.trim() !== '';
};
