import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function deleteCategory(id: string) {
  await db.delete(categories).where(eq(categories.id, id));
  return {
    message: "Category deleted successfully",
  };
}
