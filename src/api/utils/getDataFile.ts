import path from "node:path";

/**
 * Resolves the absolute path to content files within the project.
 * Supports both assets (images, media) and data (JSON) content types.
 */
export function getDataFile(file: string) {
  return path.join(process.cwd(), "content", "data", file);
}
