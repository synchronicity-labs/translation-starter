import { exists } from '@/utils/helpers';
import { OpenAI } from 'openai';

const openai = new OpenAI();

export async function POST(req: Request) {
  // Ensure the method is POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        error: { statusCode: 405, message: 'Method Not Allowed' }
      }),
      { status: 405 }
    );
  }

  const { text, language } = await req.json();

  // Check if the values exist
  if (!exists(text) || !exists(language)) {
    return new Response(
      JSON.stringify({
        error: {
          statusCode: 400,
          message: 'Missing text or language in the request body.'
        }
      }),
      { status: 400 }
    );
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an AI skilled in translating languages accurately.'
        },
        {
          role: 'user',
          content: `Translate the following text with high accuracy into ${language}. Please focus on preserving the original meaning and consider cultural nuances. Text to translate - '${text}'.`
        }
      ]
    });
    const translation = completion.choices[0].message.content;

    return new Response(JSON.stringify({ data: translation }), {
      status: 200
    });
  } catch (error) {
    console.error(`Unexpected error occurred: ${error}`);
    return new Response(
      JSON.stringify({
        error: {
          statusCode: 500,
          message: 'Unexpected error occurred'
        }
      }),
      { status: 500 }
    );
  }
}
