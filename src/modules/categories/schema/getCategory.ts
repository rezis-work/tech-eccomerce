import { z } from "zod";

export const getCategoryParams = z.object({
  id: z.string().uuid(),
});

export const getcategoryQuerySchema = z.object({
  nested: z
    .string()
    .optional()
    .transform((v) => v === "true"),
});
