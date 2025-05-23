import { z } from "zod";

export const deleteCategoryParams = z.object({
  id: z.string().uuid(),
});
