const regex = new RegExp(/(\/_image\/\?href=%2F)(.*?)(?=assets)/gm);

/**
 * Normalizes image source URLs by removing dynamic paths in test mode.
 * Helps create consistent snapshots during testing by stripping variable path segments.
 */
export function normalizeSources(sources: string): string {
  if (import.meta.env.MODE === "test") {
    return sources.replaceAll(regex, "$1");
  }
  return sources;
}
