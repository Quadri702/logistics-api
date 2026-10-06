import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    res.status(400).json({
      status: "fail",
      message: "Email already registered",
    });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  res.status(201).json({
    status: "success",
    message: "User registered successfully",
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    res.status(401).json({
      status: "fail",
      message: "Invalid email or password",
    });
    return;
  }

  const passwordCorrect = await bcrypt.compare(password, user.password);

  if (!passwordCorrect) {
    res.status(401).json({
      status: "fail",
      message: "Invalid email or password",
    });
    return;
  }

  const token = jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "1d",
    },
  );

  res.status(200).json({
    status: "success",
    token,
  });
};

export const forgotPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({
      status: "fail",
      message: "Email is required",
    });
    return;
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(200).json({
      status: "success",
      message:
        "If an account exists for that email, a password reset link has been sent.",
    });
    return;
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.passwordResetToken = hashedToken;

  user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

  await user.save();

  res.status(200).json({
    status: "success",
    message:
      "If an account exists for that email, a password reset link has been sent.",
  });
};

export const resetPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const token = req.params.token as string;
  const { password } = req.body;

  if (!token) {
    res.status(400).json({
      status: "fail",
      message: "Reset token is required",
    });
    return;
  }

  if (!password) {
    res.status(400).json({
      status: "fail",
      message: "New password is required",
    });
    return;
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: {
      $gt: new Date(),
    },
  }).select("+passwordResetToken +passwordResetExpires");

  if (!user) {
    res.status(400).json({
      status: "fail",
      message: "Invalid or expired password reset token",
    });
    return;
  }

  user.password = await bcrypt.hash(password, 12);

  await User.updateOne(
    { _id: user._id },
    {
      $unset: {
        passwordResetToken: 1,
        passwordResetExpires: 1,
      },
    },
  );

  await user.save();

  res.status(200).json({
    status: "success",
    message: "Password reset successfully",
  });
};
