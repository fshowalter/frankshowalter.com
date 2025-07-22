import { promises as fs } from "node:fs";
import { z } from "zod";

import { UpdateSchema } from "./updateSchema";
import { getContentPath } from "./utils/getContentPath";

const booklogJsonFile = getContentPath("data", "booklog.json");

const BooklogUpdateSchema = UpdateSchema.extend({
  authors: z.array(z.string()),
});

type BooklogUpdate = z.infer<typeof BooklogUpdateSchema>;

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
