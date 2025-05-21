import jwt from "jsonwebtoken";
import { db } from "@/db";
import { users, refreshTokens } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function refreshTokenService(refreshToken: string) {
  const [stored] = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.token, refreshToken));

  if (!stored) {
    throw new Error("Invalid refresh token");
  }

  let payload: { userId: string };

  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
      userId: string;
    };
  } catch (error) {
    console.error(error);
    throw new Error("Invalid refresh token");
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, payload.userId));

  if (!user) {
    throw new Error("User not found");
  }

  const newAccessToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: "15m" }
  );

  const newRefreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: "7d" }
  );

  await db.delete(refreshTokens).where(eq(refreshTokens.token, refreshToken));
  await db.insert(refreshTokens).values({
    userId: user.id,
    token: newRefreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}
