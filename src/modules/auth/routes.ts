import { Router, Request, Response, NextFunction } from "express";
import { register } from "./services/register";
import { validateRequest } from "@/middlewares/validate";
import { registerSchema } from "./schemas/register";
import { serviceWrapper } from "@/utils/serviceWrapper";

const router = Router();

router.post(
  "/register",
  validateRequest({ body: registerSchema }),
  serviceWrapper(async (req: Request, res: Response) => {
    const result = await register(req.body);
    res.status(201).json(result);
  })
);

export default router;
