import { z } from "zod";

/**
 * Base schema for content updates (book and movie reviews).
 * Provides common fields shared across different update types.
 */
export const UpdateSchema = z.object({
  date: z.coerce.date(),
  excerpt: z.string(),
  slug: z.string(),
  stars: z.number(),
  title: z.string(),
});
