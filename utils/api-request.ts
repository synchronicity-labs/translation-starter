import { SynchronicityLogger } from '@/lib/SynchronicityLogger';

const logger = new SynchronicityLogger({
  name: 'utils/apiRequest'
});

export default async function apiRequest(
  url: string,
  data: object,
  method?: string
) {
  const response = await fetch(url, {
    method: method || 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const text = await response.text();
    const err = new Error();
    const stack = err.stack;
    throw new Error(
      `HTTP error! Status: ${response.status} - ${text} - ${stack}`
    );
  }

  return response.json();
}
