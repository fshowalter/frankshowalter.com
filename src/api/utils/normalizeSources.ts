const regex = new RegExp(/(\/_image\/\?href=%2F)(.*?)(?=content)/gm);

export function normalizeSources(sources: string): string {
  if (import.meta.env.MODE === "test") {
    return sources.replaceAll(regex, "$1");
  }
  return sources;
}
