import path from "node:path";

export function getDataFile(file: string) {
  return path.join(process.cwd(), "src", "api", "fixtures", file);
}
