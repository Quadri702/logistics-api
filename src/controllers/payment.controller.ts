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
    reference,
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

    const shipment = await Shipment.findById(payment.shipment);

    if (shipment && shipment.status === "PENDING") {
      shipment.status = "CONFIRMED";

      shipment.statusHistory.push({
        status: "CONFIRMED",
        changedAt: new Date(),
      });

      await shipment.save();
    }

    res.status(200).json({
      status: "success",
      message: "Payment verified successfully",
      data: {
        payment,
        shipment,
      },
    });

    return;
  }

  if (transaction.status === "failed") {
    payment.status = "FAILED";

    await payment.save();

    res.status(200).json({
      status: "fail",
      message: "Payment failed",
      data: {
        payment,
      },
    });

    return;
  }

  if (transaction.status === "abandoned") {
    payment.status = "ABANDONED";

    await payment.save();

    res.status(200).json({
      status: "fail",
      message: "Payment was abandoned",
      data: {
        payment,
      },
    });

    return;
  }

  if (transaction.status === "reversed") {
    payment.status = "REVERSED";

    await payment.save();

    res.status(200).json({
      status: "fail",
      message: "Payment was reversed",
      data: {
        payment,
      },
    });

    return;
  }

  payment.status = "PENDING";

  await payment.save();

  res.status(200).json({
    status: "pending",
    message: "Payment is still being processed",
    data: {
      payment,
    },
  });
};

export const paystackWebhook = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const signature = req.headers["x-paystack-signature"];

  if (typeof signature !== "string") {
    res.status(400).json({
      status: "fail",
      message: "Missing Paystack signature",
    });
    return;
  }

  const rawBody = (
    req as typeof req & {
      rawBody?: Buffer;
    }
  ).rawBody;

  if (!rawBody) {
    res.status(400).json({
      status: "fail",
      message: "Request body is missing",
    });
    return;
  }

  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY as string)
    .update(rawBody)
    .digest("hex");

  if (hash !== signature) {
    res.status(401).json({
      status: "fail",
      message: "Invalid Paystack signature",
    });
    return;
  }

  const event = req.body;

  if (event.event === "charge.success") {
    const transaction = event.data;

    const payment = await Payment.findOne({
      reference: transaction.reference,
    });

    if (!payment) {
      res.status(404).json({
        status: "fail",
        message: "Payment not found",
      });
      return;
    }

    const expectedAmount = Math.round(payment.amount * 100);

    if (transaction.amount !== expectedAmount) {
      res.status(400).json({
        status: "fail",
        message: "Payment amount does not match",
      });
      return;
    }

    if (transaction.status === "success") {
      if (payment.status === "SUCCESS") {
        res.status(200).json({
          status: "success",
          message: "Payment already processed",
        });
        return;
      }

      payment.status = "SUCCESS";
      payment.paystackTransactionId = transaction.id;

      await payment.save();

      const shipment = await Shipment.findById(payment.shipment);

      if (shipment && shipment.status === "PENDING") {
        shipment.status = "CONFIRMED";

        shipment.statusHistory.push({
          status: "CONFIRMED",
          changedAt: new Date(),
        });

        await shipment.save();
      }
    }
  }

  res.status(200).json({
    status: "success",
    message: "Webhook received successfully",
  });
};
