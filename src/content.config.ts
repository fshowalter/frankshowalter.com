import type { LoaderContext } from "astro/loaders";

import { defineCollection } from "astro:content";
import { promises as fs } from "node:fs";
import path from "node:path";

import { BooklogSchema, MovielogSchema } from "./schemas";

function getDataFile(file: string) {
  return path.join(process.cwd(), "content", "data", file);
}

async function syncData(filePath: string, ctx: LoaderContext) {
  const raw = JSON.parse(await fs.readFile(filePath, "utf8")) as (Record<
    string,
    unknown
  > & { slug: string })[];

  if (raw.length === 0) {
    ctx.logger.error(`No items found in ${filePath}`);
  }

  ctx.logger.debug(`Found ${raw.length} items in ${filePath}`);

  const newIds = new Set(
    raw.map((item) => {
      const slug = item.slug;
      if (!slug) {
        throw new Error(`Item in ${filePath} is missing a slug field.`);
      }
      return slug;
    }),
  );

  for (const id of ctx.store.keys()) {
    if (!newIds.has(id)) ctx.store.delete(id);
  }

  for (const item of raw) {
    const data = await ctx.parseData({ data: item, id: item.slug });
    ctx.store.set({ data, digest: ctx.generateDigest(item), id: item.slug });
  }
}

function updateLoader(filename: string) {
  return {
    load: async (ctx: LoaderContext) => {
      const { watcher } = ctx;
      const filePath = getDataFile(filename);

      await syncData(filePath, ctx);
      watcher?.add(filePath);
      watcher?.on("change", (changedPath) => {
        if (changedPath === filePath) {
          ctx.logger.info(`Reloading data from ${filePath}`);
          void syncData(filePath, ctx);
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
