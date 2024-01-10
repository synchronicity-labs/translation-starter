export async function POST(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', {
      headers: { Allow: 'POST' },
      status: 405
    });
  }

  const { voiceId } = await req.json();

  const endpoint = `https://api.elevenlabs.io/v1/voices/${voiceId}`;

  try {
    const deletedVoice = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        'xi-api-key': process.env.ELEVEN_LABS_API_KEY as string
      }
    });

    if (!deletedVoice.ok) {
      const errorResponse = await deletedVoice.text(); // Get the detailed error message
      console.error(
        `Failed to delete voice: ${deletedVoice.status} ${deletedVoice.statusText}`
      );
      console.error(`Error response body: ${errorResponse}`);
      throw new Error(
        `Eleven Labs API call failed with status: ${deletedVoice.status}, body: ${errorResponse}`
      );
    }

    const data = await deletedVoice.json();

    return new Response(JSON.stringify({ data }), {
      status: 200
    });
  } catch (error) {
    console.error(`Failed to delete voice: `, error);
    return new Response(JSON.stringify({ error: { statusCode: 500 } }), {
      status: 500
    });
  }
}
