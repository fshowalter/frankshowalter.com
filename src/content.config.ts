import type { LoaderContext } from "astro/loaders";

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

function updateLoader(filename: string) {
  return {
    load: async (ctx: LoaderContext) => {
      const { store, watcher } = ctx;
      const filePath = getDataFile(filename);

      const sync = async () => {
        const raw = JSON.parse(await fs.readFile(filePath, "utf8")) as (Record<
          string,
          unknown
        > & { slug: string })[];

        const newIds = new Set(raw.map((item) => item.slug));

        for (const id of store.keys()) {
          if (!newIds.has(id)) store.delete(id);
        }

        for (const item of raw) {
          const data = await ctx.parseData({ data: item, id: item.slug });
          store.set({ data, digest: ctx.generateDigest(item), id: item.slug });
        }
      };

      await sync();
      watcher?.add(filePath);
      watcher?.on("change", (changedPath) => {
        if (changedPath === filePath) {
          void sync();
        }
      });
    },
    name: `${filename.replace(".json", "")}-loader`,
  };
}

const booklog = defineCollection({
  loader: updateLoader("booklog.json"),
  schema: BooklogSchema,
});

const movielog = defineCollection({
  loader: updateLoader("movielog.json"),
  schema: MovielogSchema,
});

export const collections = { booklog, movielog };
