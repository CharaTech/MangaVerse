/**
 * Adds two numeric values together.
 *
 * @param {number} first - The first addend.
 * @param {number} second - The second addend.
 * @returns {number} The arithmetic sum of the two addends.
 */
export function add(first: number, second: number): number {
  // Combine the two operands into a single sum.
  return first + second;
}

/**
 * Formats a raw manga title into a display-safe capitalized string.
 *
 * @param {string} title - The raw title to format.
 * @returns {string} The formatted, title-cased title.
 */
export function formatTitle(title: string): string {
  // Trim whitespace and capitalize the first letter of each word.
  return title.trim().replace(/\b\w/g, (character) => character.toUpperCase());
}
