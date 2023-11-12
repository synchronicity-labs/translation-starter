import { OpenAI } from 'openai';

const openai = new OpenAI();

export async function POST(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', {
      headers: { Allow: 'POST' },
      status: 405
    });
  }

  const { text, language } = await req.json();

  try {
    console.log(`starting translation on: ${text}`);
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an AI skilled in translating languages accurately.'
        },
        {
          role: 'user',
          content: `Translate the following text with high accuracy into ${language}: '${text}'. Please focus on preserving the original meaning and consider cultural nuances.`
        }
      ]
    });
    console.log('translation - completion: ', completion);
    const translation = completion.choices[0].message.content;
    return new Response(JSON.stringify({ data: translation }), {
      status: 200
    });
  } catch (error) {
    console.error(`Failed to translate text: `, error);
    return new Response(JSON.stringify({ error: { statusCode: 500 } }), {
      status: 500
    });
  }
}
