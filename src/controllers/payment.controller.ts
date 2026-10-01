import type { Response } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import Shipment from "../models/shipment.model.js";
import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";
import crypto from "crypto";
import {
  initializePaystackPayment,
  verifyPaystackPayment,
} from "../services/paystack.service.js";

export const initializePayment = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  if (!req.userId) {
    res.status(401).json({
      status: "fail",
      message: "Authentication required",
    });

    return;
  }

  const shipment = await Shipment.findById(req.params.shipmentId);

  if (!shipment) {
    res.status(404).json({
      status: "fail",
      message: "Shipment not found",
    });

    return;
  }

  if (shipment.customer.toString() !== req.userId) {
    res.status(403).json({
      status: "fail",
      message: "You can only pay for your own shipment",
    });

    return;
  }

  const existingPayment = await Payment.findOne({
    shipment: shipment._id,
    status: {
      $in: ["PENDING", "SUCCESS"],
    },
  });

  if (existingPayment) {
    res.status(400).json({
      status: "fail",
      message: "Payment already exists for this shipment",
    });

    return;
  }

  const customer = await User.findById(req.userId);

  if (!customer) {
    res.status(404).json({
      status: "fail",
      message: "Customer not found",
    });

    return;
  }

  const reference = `LGX-PAY-${crypto
    .randomBytes(8)
    .toString("hex")
    .toUpperCase()}`;

  const amountInKobo = Math.round(shipment.deliveryFee * 100);

  const paystackResponse = await initializePaystackPayment({
    email: customer.email,
    amount: amountInKobo,
    reference,
  });

  const payment = await Payment.create({
    shipment: shipment._id,
    customer: req.userId,
    amount: shipment.deliveryFee,
    reference,
    status: "PENDING",
  });

  res.status(201).json({
    status: "success",
    message: "Payment initialized successfully",
    data: {
      payment,
      authorizationUrl: paystackResponse.data.authorization_url,
      reference,
    },
  });
};

export const verifyPayment = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  if (!req.userId) {
    res.status(401).json({
      status: "fail",
      message: "Authentication required",
    });
    return;
  }

  const reference = req.params.reference;

  if (typeof reference !== "string") {
    res.status(400).json({
      status: "fail",
      message: "Payment reference is required",
    });
    return;
  }

  const payment = await Payment.findOne({
    reference: reference,
  });

  if (!payment) {
    res.status(404).json({
      status: "fail",
      message: "Payment not found",
    });
    return;
  }

  if (payment.customer.toString() !== req.userId) {
    res.status(403).json({
      status: "fail",
      message: "You can only verify your own payment",
    });
    return;
  }

  const paystackResponse = await verifyPaystackPayment(reference);

  const transaction = paystackResponse.data;

  if (!transaction) {
    res.status(400).json({
      status: "fail",
      message: "Unable to verify payment with Paystack",
    });
    return;
  }

  if (transaction.status === "success") {
    payment.status = "SUCCESS";
    payment.paystackTransactionId = transaction.id;

    await payment.save();

    res.status(200).json({
      status: "success",
      message: "Payment verified successfully",
      data: {
        payment,
      },
    });

    return;
  }

  payment.status = "FAILED";

  await payment.save();

  res.status(200).json({
    status: "fail",
    message: "Payment was not successful",
    data: {
      payment,
    },
  });
};
