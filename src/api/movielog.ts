import { promises as fs } from "node:fs";
import { z } from "zod";

import { UpdateSchema } from "./UpdateSchema";
import { getContentPath } from "./utils/getContentPath";

const movielogJsonFile = getContentPath("data", "movielog.json");

const MovielogUpdateSchema = UpdateSchema.extend({
  year: z.string(),
});

type MovielogUpdate = z.infer<typeof MovielogUpdateSchema>;

export async function movielogUpdates(): Promise<MovielogUpdate[]> {
  return parseMovielogJson();
}

async function parseMovielogJson() {
  const json = await fs.readFile(movielogJsonFile, "utf8");
  const data = JSON.parse(json) as unknown[];

  return data.map((item) => {
    return MovielogUpdateSchema.parse(item);
  });
}
