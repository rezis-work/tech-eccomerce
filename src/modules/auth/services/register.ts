import { db } from "@/db";
import { users } from "@/db/schema";
import bcrypt from "bcryptjs";
import { RegisterInput } from "../schemas/register";

export async function register(data: RegisterInput) {
  const existing = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.email, data.email),
  });

  if (existing) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const [user] = await db
    .insert(users)
    .values({
      email: data.email,
      passwordHash: hashedPassword,
      name: data.name,
      age: data.age,
      phone: data.phone,
    })
    .returning();

  return {
    message: "User registered successfully",
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
