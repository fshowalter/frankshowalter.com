import path from "node:path";

export function getContentPath(
  kind: "data" | "pages" | "readings" | "reviews",
  subPath?: string,
) {
  if (subPath) {
    return path.join(process.cwd(), "content", kind, subPath);
  }

  return path.join(process.cwd(), "content", kind);
}
