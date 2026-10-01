import mongoose, { Schema } from "mongoose";
import type { Document } from "mongoose";

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";

export interface IPayment extends Document {
  shipment: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  amount: number;
  reference: string;
  status: PaymentStatus;
  paystackTransactionId?: number;
}

const paymentSchema = new Schema<IPayment>(
  {
    shipment: {
      type: Schema.Types.ObjectId,
      ref: "Shipment",
      required: true,
    },

    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    reference: {
      type: String,
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },

    paystackTransactionId: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);

const Payment = mongoose.model<IPayment>("Payment", paymentSchema);

export default Payment;
