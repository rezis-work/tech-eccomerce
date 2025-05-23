// src/types/express/index.d.ts
import { UserRole } from "@/db/schema";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        age: number;
        role: UserRole | string;
        phone: string;
      };
    }
  }
}
