import mongoose, { Document, Schema } from "mongoose";

export type ShipmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "ASSIGNED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "DELIVERY_FAILED"
  | "RESCHEDULED"
  | "CANCELLED";

export interface IShipmentStatusHistory {
  status: ShipmentStatus;
  changedAt: Date;
}

export interface IShipment extends Document {
  customer: mongoose.Types.ObjectId;
  assignedAgent?: mongoose.Types.ObjectId;
  pickupAddress: string;
  deliveryAddress: string;
  packageDescription: string;
  weight: number;
  deliveryFee: number;
  trackingNumber: string;
  status: ShipmentStatus;
  statusHistory: IShipmentStatusHistory[];
}

const shipmentSchema = new Schema<IShipment>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedAgent: {
      type: Schema.Types.ObjectId,
      ref: "DeliveryAgent",
    },

    pickupAddress: {
      type: String,
      required: true,
      trim: true,
    },

    deliveryAddress: {
      type: String,
      required: true,
      trim: true,
    },

    packageDescription: {
      type: String,
      required: true,
      trim: true,
    },

    weight: {
      type: Number,
      required: true,
      min: 0.1,
    },

    deliveryFee: {
      type: Number,
      required: true,
      min: 0,
    },

    trackingNumber: {
      type: String,
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "ASSIGNED",
        "PICKED_UP",
        "IN_TRANSIT",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "DELIVERY_FAILED",
        "RESCHEDULED",
        "CANCELLED",
      ],
      default: "PENDING",
    },

    statusHistory: [
      {
        status: {
          type: String,
          enum: [
            "PENDING",
            "CONFIRMED",
            "ASSIGNED",
            "PICKED_UP",
            "IN_TRANSIT",
            "OUT_FOR_DELIVERY",
            "DELIVERED",
            "DELIVERY_FAILED",
            "RESCHEDULED",
            "CANCELLED",
          ],
          required: true,
        },

        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Shipment = mongoose.model<IShipment>("Shipment", shipmentSchema);

export default Shipment;
