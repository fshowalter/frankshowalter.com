export function sorted<T extends { data: { date: Date } }>(items: T[]): T[] {
  return items.toSorted((a, b) => {
    return a.data.date < b.data.date ? 1 : a.data.date > b.data.date ? -1 : 0;
  });
}
