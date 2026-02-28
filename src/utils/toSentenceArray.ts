/**
 * Converts an array of elements into a sentence-like array by adding commas and "and" between elements.
 * For example: ["a", "b", "c"] becomes ["a", ", ", "b", ", ", "and ", "c"]
 */
export function toSentenceArray(values: readonly string[]): string[] {
  const words = values.filter(Boolean);

  if (words.length < 2) {
    return words;
  }

  const lastWord = words.at(-1);

  if (!lastWord) {
    return words;
  }

  const lastWords = [" and ", lastWord];
  if (words.length === 1) {
    return [...words, ...lastWords];
  }

  const wordsWithCommas = [];

  for (const word of words) {
    wordsWithCommas.push(word, ", ");
  }

  return [...wordsWithCommas, ...lastWords];
}
