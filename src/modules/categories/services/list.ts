import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq, isNull } from "drizzle-orm";

export async function getCategories({
  nested,
  parentId,
}: {
  nested?: boolean;
  parentId?: string;
}) {
  const baseWhere = parentId
    ? eq(categories.parentId, parentId)
    : isNull(categories.parentId);

  const list = await db.select().from(categories).where(baseWhere);

  if (!nested) return list;

  const buildTree = async (parentList: typeof list) => {
    return Promise.all(
      parentList.map(async (cat) => {
        const children = await db
          .select()
          .from(categories)
          .where(eq(categories.parentId, cat.id));
        return {
          ...cat,
          children,
        };
      })
    );
  };

  return await buildTree(list);
}
