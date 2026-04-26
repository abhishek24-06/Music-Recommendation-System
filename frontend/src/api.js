const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";

/**
 * Fetch top-10 song recommendations for a given song name.
 * @param {string} song
 * @returns {Promise<{recommendations: Array, message?: string}>}
 */
export async function getRecommendations(song) {
  const res = await fetch(
    `${BASE_URL}/recommend?song=${encodeURIComponent(song)}`
  );
  if (!res.ok) throw new Error(`Server error: ${res.status}`);
  return res.json();
}

/**
 * Autocomplete search — returns up to 10 matching tracks.
 * @param {string} query
 * @returns {Promise<{results: Array}>}
 */
export async function searchSongs(query) {
  const res = await fetch(
    `${BASE_URL}/search?q=${encodeURIComponent(query)}`
  );
  if (!res.ok) throw new Error(`Server error: ${res.status}`);
  return res.json();
}
