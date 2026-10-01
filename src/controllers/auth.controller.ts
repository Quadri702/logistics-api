import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

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

  const user = await User.findOne({ email });

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
