import { z } from "astro/zod";

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
