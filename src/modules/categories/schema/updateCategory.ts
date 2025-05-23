import { z } from "zod";

export const updateCategorySchema = z.object({
  name: z.record(z.string()).optional(),
  slug: z.string().min(1).optional(),
  parentId: z.string().uuid().optional().nullable(),
});

export const updateCategoryParams = z.object({
  id: z.string().uuid(),
});

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
