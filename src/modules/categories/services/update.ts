import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { UpdateCategoryInput } from "../schema/updateCategory";

export async function updateCategory(id: string, data: UpdateCategoryInput) {
  const [category] = await db
    .update(categories)
    .set(data)
    .where(eq(categories.id, id))
    .returning();

  return {
    message: "Category updated successfully",
    category,
  };
}
