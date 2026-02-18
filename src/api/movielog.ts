import { promises as fs } from "node:fs";
import { z } from "zod";

import { UpdateSchema } from "./UpdateSchema";
import { getDataFile } from "./utils/getDataFile";

const movielogJsonFile = getDataFile("movielog.json");

const MovielogUpdateSchema = UpdateSchema.extend({
  genres: z.array(z.string()),
  year: z.string(),
});

type MovielogUpdate = z.infer<typeof MovielogUpdateSchema>;

/**
 * Fetches and parses all movie review updates from the movielog JSON file.
 * Returns an array of validated movielog entries with year and rating information.
 */
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
