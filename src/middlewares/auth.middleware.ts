import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: string;
}

export const protect = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      status: "fail",
      message: "Authentication required",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({
      status: "fail",
      message: "Authentication required",
    });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as unknown as {
      id: string;
      role: string;
    };

    req.userId = decoded.id;
    req.userRole = decoded.role;

    next();
  } catch {
    res.status(401).json({
      status: "fail",
      message: "Invalid or expired token",
    });
  }
};
