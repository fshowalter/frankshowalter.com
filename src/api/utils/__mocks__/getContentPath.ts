import path from "node:path";

export function getContentPath(kind: "assets" | "data", subPath?: string) {
  if (subPath) {
    return path.join(process.cwd(), "src", "api", "fixtures", kind, subPath);
  }

  return path.join(process.cwd(), "src", "api", "fixtures", kind);
}
