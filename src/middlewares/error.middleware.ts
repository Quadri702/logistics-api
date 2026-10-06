import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError.js";

const handleCastError = (err: any): AppError => {
  return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
};

const handleDuplicateFields = (err: any): AppError => {
  const value = Object.values(err.keyValue)[0];

  return new AppError(`Duplicate field value: ${value}`, 400);
};

const handleJWTError = (): AppError => {
  return new AppError("Invalid token. Please log in again.", 401);
};

const handleJWTExpiredError = (): AppError => {
  return new AppError("Your token has expired. Please log in again.", 401);
};

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  console.error(err);

  let error = err;

  if (err.name === "CastError") {
    error = handleCastError(err);
  }

  if ((err as any).code === 11000) {
    error = handleDuplicateFields(err);
  }

  if (err.name === "JsonWebTokenError") {
    error = handleJWTError();
  }

  if (err.name === "TokenExpiredError") {
    error = handleJWTExpiredError();
  }

  if (process.env.NODE_ENV === "development") {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      status: error instanceof AppError ? error.status : "error",

      message: error.message,

      error,

      stack: error.stack,
    });

    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });

    return;
  }

  res.status(500).json({
    status: "error",
    message: "Something went wrong",
  });
};
