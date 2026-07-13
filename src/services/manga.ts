/**
 * Describes the minimal metadata shown for a manga title in listings.
 */
export interface MangaSummary {
  /** Stable unique identifier for the manga. */
  id: string;
  /** Human-readable display title. */
  title: string;
}

/**
 * Fetches a manga summary from the MangaVerse API by its identifier.
 *
 * @param {string} mangaId - The unique identifier of the manga.
 * @returns {Promise<MangaSummary>} The fetched manga summary.
 */
export async function fetchMangaSummary(mangaId: string): Promise<MangaSummary> {
  // Request the manga metadata from the upstream API endpoint.
  const response = await fetch(`/api/v1/manga/${mangaId}`);
  // Parse the JSON response body into the expected shape.
  const mangaSummary = (await response.json()) as MangaSummary;
  return mangaSummary;
}
