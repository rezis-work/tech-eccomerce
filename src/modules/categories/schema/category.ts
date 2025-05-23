import { z } from "zod";

export const getCategoriesQuerySchema = z.object({
  nested: z
    .string()
    .optional()
    .transform((val) => val === "true"),
  parentId: z.string().uuid().optional(),
});
