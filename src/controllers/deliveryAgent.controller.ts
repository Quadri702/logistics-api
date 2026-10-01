import type { Request, Response } from "express";
import User from "../models/user.model.js";
import DeliveryAgent from "../models/deliveryAgent.model.js";

export const createDeliveryAgent = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { userId, phone, vehicleType, vehicleNumber } = req.body;

  const user = await User.findById(userId);

  if (!user) {
    res.status(404).json({
      status: "fail",
      message: "User not found",
    });

    return;
  }

  if (user.role !== "delivery_agent") {
    res.status(400).json({
      status: "fail",
      message: "User must have the delivery_agent role",
    });

    return;
  }

  const existingAgent = await DeliveryAgent.findOne({
    user: userId,
  });

  if (existingAgent) {
    res.status(400).json({
      status: "fail",
      message: "Delivery agent profile already exists",
    });

    return;
  }

  const deliveryAgent = await DeliveryAgent.create({
    user: userId,
    phone,
    vehicleType,
    vehicleNumber,
  });

  res.status(201).json({
    status: "success",
    message: "Delivery agent created successfully",
    data: {
      deliveryAgent,
    },
  });
};

export const getAllDeliveryAgents = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const deliveryAgents = await DeliveryAgent.find().populate(
    "user",
    "name email role",
  );

  res.status(200).json({
    status: "success",
    results: deliveryAgents.length,
    data: {
      deliveryAgents,
    },
  });
};
