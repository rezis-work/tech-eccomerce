import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCategoryById(id: string, nested?: boolean) {
  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id));

  if (!category) {
    throw Object.assign(new Error("category not found"), {
      statusCode: 404,
    });
  }

  if (!nested) return { category };

  const children = await db
    .select()
    .from(categories)
    .where(eq(categories.parentId, id));

  return {
    category: {
      ...category,
      children,
    },
  };
}
