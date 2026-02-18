import { promises as fs } from "node:fs";
import { z } from "zod";

import { UpdateSchema } from "./UpdateSchema";
import { getDataFile } from "./utils/getDataFile";

const booklogJsonFile = getDataFile("booklog.json");

const BooklogUpdateSchema = UpdateSchema.extend({
  authors: z.array(z.string()),
  kind: z.string(),
  workYear: z.string(),
});

type BooklogUpdate = z.infer<typeof BooklogUpdateSchema>;

/**
 * Fetches and parses all book review updates from the booklog JSON file.
 * Returns an array of validated booklog entries with author and rating information.
 */
export async function booklogUpdates(): Promise<BooklogUpdate[]> {
  return parseBooklogJson();
}

async function parseBooklogJson() {
  const json = await fs.readFile(booklogJsonFile, "utf8");
  const data = JSON.parse(json) as unknown[];

  return data.map((item) => {
    return BooklogUpdateSchema.parse(item);
  });
}
