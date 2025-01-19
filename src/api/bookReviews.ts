import { promises as fs } from "node:fs";
import { z } from "zod";

import { getContentPath } from "./utils/getContentPath";

const booklogJsonFile = getContentPath("data", "booklog.json");

const BookReviewJsonSchema = z.object({
  title: z.string(),
  date: z.coerce.date(),
  slug: z.string(),
  yearPublished: z.string(),
  kind: z.string(),
  authorNames: z.array(z.string()),
  stars: z.number(),
});

export type BookReview = z.infer<typeof BookReviewJsonSchema>;

export async function recentBookReviews(): Promise<BookReview[]> {
  return parseBooklogJson();
}

async function parseBooklogJson() {
  const json = await fs.readFile(booklogJsonFile, "utf8");
  const data = JSON.parse(json) as unknown[];

  return data.map((item) => {
    return BookReviewJsonSchema.parse(item);
  });
}
