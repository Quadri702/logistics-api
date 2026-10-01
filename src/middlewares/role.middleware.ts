import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "./auth.middleware.js";
import type { UserRole } from "../models/user.model.js";

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): void => {
    if (!req.userRole || !allowedRoles.includes(req.userRole as UserRole)) {
      res.status(403).json({
        status: "fail",
        message: "You do not have permission to perform this action",
      });

      return;
    }

    next();
  };
};
