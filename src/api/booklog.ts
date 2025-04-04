import type { z } from "zod";

import { promises as fs } from "node:fs";

import { UpdateSchema } from "./updateSchema";
import { getContentPath } from "./utils/getContentPath";

const booklogJsonFile = getContentPath("data", "booklog.json");

type BooklogUpdate = z.infer<typeof UpdateSchema>;

export async function booklogUpdates(): Promise<BooklogUpdate[]> {
  return parseBooklogJson();
}

async function parseBooklogJson() {
  const json = await fs.readFile(booklogJsonFile, "utf8");
  const data = JSON.parse(json) as unknown[];

  return data.map((item) => {
    return UpdateSchema.parse(item);
  });
}
