import { z } from "zod";

export const UpdateSchema = z.object({
  title: z.string(),
  slug: z.string(),
  stars: z.number(),
});
