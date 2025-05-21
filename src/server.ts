import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import authRoutes from "@/modules/auth/routes";
import { requireRole } from "./middlewares/requireRole";

const swaggerDocument = YAML.load("./swagger/swagger.yaml");

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/auth", authRoutes);

app.get(
  "/api/admin/stats",
  requireRole("ADMIN"),
  (req: Request, res: Response) => {
    res.json({ message: `Welcome admin ${req.user!.name}` });
  }
);

app.use((err: any, req: Request, res: Response, next: express.NextFunction) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  console.error(err);
  res.status(status).json({ message });
});

export default app;
