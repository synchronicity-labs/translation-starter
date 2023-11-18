/**
 * Performs a POST request to a given URL with JSON data.
 *
 * This function simplifies making HTTP POST requests by handling JSON stringification
 * of the request body and setting appropriate headers. It throws an error for non-success
 * HTTP response statuses.
 *
 * @param {string} url - The URL for the POST request.
 * @param {Object} data - The data to be sent as the request body.
 * @returns {Promise<any>} - A promise that resolves to the JSON response body.
 * @throws {Error} - For non-success HTTP response statuses.
 */
export default async function apiRequest(url: string, data: Object) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return response.json();
}
