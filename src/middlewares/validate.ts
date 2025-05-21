import { Request, Response, NextFunction } from "express";
import { ZodError, ZodTypeAny } from "zod";

type ValidateOptions = {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
};

export function validateRequest(schema: ValidateOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.body) req.body = schema.body.parse(req.body);
      if (schema.params) req.params = schema.params.parse(req.params);
      if (schema.query) req.query = schema.query.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: "Validation error",
          errors: error.errors.map((err) => ({
            path: err.path.join("."),
          })),
        });
      }
      next(error);
    }
  };
}
