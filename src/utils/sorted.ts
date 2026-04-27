export function sorted<T extends { data: { sequence: number } }>(
  items: T[],
): T[] {
  return items.toSorted((a, b) => {
    return a.data.sequence - b.data.sequence;
  });
}
