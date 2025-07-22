import type { JSX } from "react";
export function toSentenceArray<T extends JSX.Element | string>(
  values: readonly T[],
): T[] {
  const words = values.filter(Boolean);

  if (words.length < 2) {
    return words;
  }

  const lastWord = words.pop();

  if (!lastWord) {
    return words;
  }

  const lastWords = [" and ", lastWord];
  if (words.length === 1) {
    return [...words, ...lastWords] as T[];
  }

  const wordsWithCommas = [];

  for (const word of words) {
    wordsWithCommas.push(word, ", ");
  }

  return [...wordsWithCommas, ...lastWords] as T[];
}
