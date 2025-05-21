import { db } from "@/db";
import { categories } from "@/db/schema";
import { CreateCategoryInput } from "../schema/createCategory";

export async function createCategory(data: CreateCategoryInput) {
  const [category] = await db.insert(categories).values(data).returning();
  return {
    message: "Category created successfully",
    category,
  };
}
