import { promises as fs } from "node:fs";
import { z } from "zod";

import { UpdateSchema } from "./updateSchema";

import { getContentPath } from "./utils/getContentPath";

const movielogJsonFile = getContentPath("data", "movielog.json");

export type MovielogUpdate = z.infer<typeof UpdateSchema>;

export async function movielogUpdates(): Promise<MovielogUpdate[]> {
  return parseMovielogJson();
}

async function parseMovielogJson() {
  const json = await fs.readFile(movielogJsonFile, "utf8");
  const data = JSON.parse(json) as unknown[];

  return data.map((item) => {
    return UpdateSchema.parse(item);
  });
}
