import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2),
  age: z.number().int().min(13).max(120),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(10).max(15),
});

export type RegisterInput = z.infer<typeof registerSchema>;
