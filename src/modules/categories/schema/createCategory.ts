import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.record(z.string()),
  slug: z.string(),
  parentId: z.string().uuid().optional().nullable(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
