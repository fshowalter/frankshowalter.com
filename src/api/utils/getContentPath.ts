import path from "node:path";

/**
 * Resolves the absolute path to content files within the project.
 * Supports both assets (images, media) and data (JSON) content types.
 */
export function getContentPath(kind: "assets" | "data", subPath?: string) {
  if (subPath) {
    return path.join(process.cwd(), "content", kind, subPath);
  }

  return path.join(process.cwd(), "content", kind);
}
