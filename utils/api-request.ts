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
    throw new Error(`HTTP error! Status: ${response.status} - ${text}`);
  }

  return response.json();
}
