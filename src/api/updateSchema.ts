import { z } from "zod";

export const UpdateSchema = z.object({
  date: z.coerce.date(),
  slug: z.string(),
  stars: z.number(),
  title: z.string(),
});
