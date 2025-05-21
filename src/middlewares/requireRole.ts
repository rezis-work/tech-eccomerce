import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export function requireRole(...roles: ("ADMIN" | "USER" | "COURIER")[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies.accessToken;

      if (!token) {
        res.status(401).json({
          message: "Unauthorized: no token",
        });
        return;
      }

      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as {
        userId: string;
        role: "ADMIN" | "USER" | "COURIER";
      };

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, payload.userId));

      if (!user) {
        res.status(401).json({
          message: "Unauthorized: user not found",
        });
        return;
      }

      if (!roles.includes(user.role)) {
        res.status(403).json({
          message: "Forbidden: insufficient permissions",
        });
        return;
      }

      req.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        age: user.age,
        role: user.role,
        phone: user.phone,
      };
      next();
    } catch (error) {
      console.error("RBAC error", error);
      res.status(401).json({
        message: "Unauthorized: invalid or expired token",
      });
      return;
    }
  };
}
