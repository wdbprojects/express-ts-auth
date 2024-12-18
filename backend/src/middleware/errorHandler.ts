import { ErrorRequestHandler, Response } from "express";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../constants/http";
import { z } from "zod";
import AppErrorCode from "../constants/appErrorCode";
import AppError from "../utils/AppError";

const handleZodError = (res: Response, err: z.ZodError) => {
  const errors = err?.issues?.map((item) => {
    return { path: item.path.join("."), message: item.message };
  });
  res.status(BAD_REQUEST).json({ message: err.message, errors: errors });
};

const handleAppError = (res: Response, err: AppError) => {
  res
    .status(err.statusCode)
    .json({ message: err.message, errorCode: err.errorCode });
};

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.log(`PATH: ${req.path}`, err);

  if (err instanceof z.ZodError) {
    return handleZodError(res, err);
  }

  if (err instanceof AppError) {
    return handleAppError(res, err);
  }

  res
    .status(INTERNAL_SERVER_ERROR)
    .json({ message: "Internal server error from errorHandler.ts" });
};

export default errorHandler;
