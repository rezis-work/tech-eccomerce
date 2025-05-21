import { RequestHandler, Request, Response, NextFunction } from "express";

export const serviceWrapper = (service: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await service(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
