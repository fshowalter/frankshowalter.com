import path from "node:path";

export function getContentPath(
  kind: "data" | "reviews" | "viewings",
  subPath?: string,
) {
  if (subPath) {
    return path.join(
      process.cwd(),
      "src",
      "api",
      "data",
      "fixtures",
      kind,
      subPath,
    );
  }

  return path.join(process.cwd(), "src", "api", "data", "fixtures", kind);
}
