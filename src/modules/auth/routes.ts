import { Router, Request, Response, NextFunction } from "express";
import { register } from "./services/register";
import { validateRequest } from "@/middlewares/validate";
import { registerSchema } from "./schemas/register";
import { serviceWrapper } from "@/utils/serviceWrapper";
import { loginSchema } from "./schemas/login";
import { login } from "./services/login";
import { requireAuth } from "@/middlewares/requireAuth";
import { refreshTokenService } from "./services/refresh";
import { logout } from "./services/logout";

const router = Router();

router.post(
  "/register",
  validateRequest({ body: registerSchema }),
  serviceWrapper(async (req: Request, res: Response) => {
    const result = await register(req.body);
    res.status(201).json(result);
  })
);

router.post(
  "/login",
  validateRequest({ body: loginSchema }),
  serviceWrapper(async (req: Request, res: Response) => {
    const { accessToken, refreshToken, user } = await login(req.body);

    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        maxAge: 15 * 60 * 1000,
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: "Login successful",
        user,
      });
  })
);

router.get(
  "/me",
  requireAuth,
  serviceWrapper(async (req: Request, res: Response) => {
    res.json(req.user);
  })
);

router.get(
  "/refresh-token",
  serviceWrapper(async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;
    if (!token) {
      res.status(401).json({
        message: "Unauthorized",
      });
      return;
    }

    const { accessToken, refreshToken } = await refreshTokenService(token);

    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        maxAge: 15 * 60 * 1000,
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: "Token refreshed",
      });
  })
);

router.get(
  "/logout",
  serviceWrapper(async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;
    await logout(token);

    res
      .clearCookie("accessToken", { httpOnly: true })
      .clearCookie("refreshToken", { httpOnly: true })
      .status(200)
      .json({
        message: "Logout successful",
      });
  })
);

export default router;
