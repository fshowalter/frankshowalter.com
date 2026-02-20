import path from "node:path";

/**
 * Resolves the absolute path to content data files within the project.
 */
export function getDataFile(file: string) {
  return path.join(process.cwd(), "content", "data", file);
}
