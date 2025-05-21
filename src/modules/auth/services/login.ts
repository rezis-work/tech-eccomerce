import { db } from "@/db";
import { refreshTokens, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { LoginInput } from "../schemas/login";
import jwt from "jsonwebtoken";

export async function login(data: LoginInput) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, data.email));

  if (!user) {
    throw new Error("Invalid credentials email or password");
  }

  const accessToken = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    process.env.JWT_ACCESS_SECRET!,
    {
      expiresIn: "15m",
    }
  );

  const refreshToken = jwt.sign(
    {
      userId: user.id,
    },
    process.env.JWT_REFRESH_SECRET!,
    {
      expiresIn: "7d",
    }
  );

  await db.insert(refreshTokens).values({
    userId: user.id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      age: user.age,
      phone: user.phone,
      role: user.role,
    },
  };
}
