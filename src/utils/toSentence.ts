const formatter = new Intl.ListFormat("en", {
  style: "long",
  type: "conjunction",
});

export function toSentence(items: string[]): string {
  return formatter.format(items);
}
