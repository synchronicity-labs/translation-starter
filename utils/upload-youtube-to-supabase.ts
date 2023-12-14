export default async function uploadYouTubeToSupabase(
  url: string,
  pathPrefix: string
) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AWS_LAMBDA_UPLOAD_YOUTUBE_TO_SUPABASE_URL}`,
      {
        method: 'POST',
        body: JSON.stringify({
          url,
          pathPrefix
        })
      }
    );

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();

    return data; // or handle data as needed
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
}
