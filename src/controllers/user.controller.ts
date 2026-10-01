import type { Request, Response } from "express";
import User from "../models/user.model.js";

export const getAllUsers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const users = await User.find().select("-password");

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    res.status(404).json({
      status: "fail",
      message: "User not found",
    });
    return;
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
};

export const updateUserRole = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { role } = req.body;

  const allowedRoles = ["customer", "delivery_agent", "admin"];

  if (!allowedRoles.includes(role)) {
    res.status(400).json({
      status: "fail",
      message: "Invalid role",
    });
    return;
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    {
      new: true,
      runValidators: true,
    },
  ).select("-password");

  if (!user) {
    res.status(404).json({
      status: "fail",
      message: "User not found",
    });
    return;
  }

  res.status(200).json({
    status: "success",
    message: "User role updated successfully",
    data: {
      user,
    },
  });
};
