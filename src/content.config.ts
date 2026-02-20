import { defineCollection } from "astro:content";
import { promises as fs } from "node:fs";
import { z } from "zod";

import { getDataFile } from "~/api/utils/getDataFile";

const UpdateSchema = z.object({
  date: z.coerce.date(),
  excerpt: z.string(),
  slug: z.string(),
  stars: z.number(),
  title: z.string(),
});

export const BooklogSchema = UpdateSchema.extend({
  authors: z.array(z.string()),
  kind: z.string(),
  workYear: z.string(),
});

export const MovielogSchema = UpdateSchema.extend({
  genres: z.array(z.string()),
  year: z.string(),
});

export type BooklogData = z.infer<typeof BooklogSchema>;
export type MovielogData = z.infer<typeof MovielogSchema>;

const booklog = defineCollection({
  loader: {
    load: async ({ store }) => {
      const raw = JSON.parse(
        await fs.readFile(getDataFile("booklog.json"), "utf8"),
      ) as { slug: string }[];
      const newIds = new Set(raw.map((item) => item.slug));
      for (const id of store.keys()) {
        if (!newIds.has(id)) store.delete(id);
      }
      for (const item of raw) {
        store.set({ data: item, id: item.slug });
      }
    },
    name: "booklog-loader",
  },
  schema: BooklogSchema,
});

const movielog = defineCollection({
  loader: {
    load: async ({ store }) => {
      const raw = JSON.parse(
        await fs.readFile(getDataFile("movielog.json"), "utf8"),
      ) as { slug: string }[];
      const newIds = new Set(raw.map((item) => item.slug));
      for (const id of store.keys()) {
        if (!newIds.has(id)) store.delete(id);
      }
      for (const item of raw) {
        store.set({ data: item, id: item.slug });
      }
    },
    name: "movielog-loader",
  },
  schema: MovielogSchema,
});

export const collections = { booklog, movielog };
