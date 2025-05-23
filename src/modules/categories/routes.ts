import { requireRole } from "@/middlewares/requireRole";
import { validateRequest } from "@/middlewares/validate";
import { Router } from "express";
import { createCategorySchema } from "./schema/createCategory";
import { serviceWrapper } from "@/utils/serviceWrapper";
import { createCategory } from "./services/create";
import { getCategoriesQuerySchema } from "./schema/category";
import { getCategories } from "./services/list";
import {
  updateCategoryParams,
  updateCategorySchema,
} from "./schema/updateCategory";
import { updateCategory } from "./services/update";
import { deleteCategoryParams } from "./schema/deleteCategory";
import { deleteCategory } from "./services/delete";
import { getCategoryParams } from "./schema/getCategory";
import { getCategoryById } from "./services/getById";

const router = Router();

router.post(
  "/",
  requireRole("ADMIN"),
  validateRequest({
    body: createCategorySchema,
  }),
  serviceWrapper(async (req, res) => {
    const result = await createCategory(req.body);
    res.status(201).json(result);
  })
);

router.get(
  "/",
  validateRequest({
    query: getCategoriesQuerySchema,
  }),
  serviceWrapper(async (req, res) => {
    const result = await getCategories(req.query);
    res.json({ categories: result });
  })
);

router.put(
  "/:id",
  requireRole("ADMIN"),
  validateRequest({
    body: updateCategorySchema,
    params: updateCategoryParams,
  }),
  serviceWrapper(async (req, res) => {
    const result = await updateCategory(req.params.id, req.body);
    res.status(200).json(result);
  })
);

router.delete(
  "/:id",
  requireRole("ADMIN"),
  validateRequest({
    params: deleteCategoryParams,
  }),
  serviceWrapper(async (req, res) => {
    const result = await deleteCategory(req.params.id);
    res.status(200).json(result);
  })
);

router.get(
  "/:id",
  validateRequest({
    params: getCategoryParams,
    query: getCategoriesQuerySchema,
  }),
  serviceWrapper(async (req, res) => {
    const result = await getCategoryById(
      req.params.id,
      req.query.nested as unknown as boolean
    );
    res.status(200).json(result);
  })
);

export default router;
