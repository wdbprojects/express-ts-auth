import { Request, Response, NextFunction } from "express";

type AsyncController = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

const catchAsyncErrors =
  (controller: AsyncController): AsyncController =>
  async (req, res, next) => {
    try {
      await controller(req, res, next);
    } catch (err) {
      next(err);
    }
  };

export default catchAsyncErrors;
