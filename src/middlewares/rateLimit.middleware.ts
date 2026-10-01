import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "./auth.middleware.js";
import { incrementRateLimit } from "../services/redis.service.js";

export const rateLimit = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  if (!req.userId) {
    res.status(401).json({
      status: "fail",
      message: "Authentication required",
    });

    return;
  }

  const key = `rate-limit:user:${req.userId}`;

  const limit = 5;
  const windowInSeconds = 60;

  const currentCount = await incrementRateLimit(key, windowInSeconds);

  if (currentCount > limit) {
    res.status(429).json({
      status: "fail",
      message: "Too many requests. Please try again later.",
    });

    return;
  }

  next();
};
