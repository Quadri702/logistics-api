import mongoose, { Schema } from "mongoose";
import type { Document } from "mongoose";

export type VehicleType = "BIKE" | "CAR" | "VAN";

export type AgentAvailability = "AVAILABLE" | "BUSY" | "OFFLINE";

export interface IDeliveryAgent extends Document {
  user: mongoose.Types.ObjectId;
  phone: string;
  vehicleType: VehicleType;
  vehicleNumber: string;
  availability: AgentAvailability;
}

const deliveryAgentSchema = new Schema<IDeliveryAgent>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    vehicleType: {
      type: String,
      enum: ["BIKE", "CAR", "VAN"],
      required: true,
    },

    vehicleNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    availability: {
      type: String,
      enum: ["AVAILABLE", "BUSY", "OFFLINE"],
      default: "AVAILABLE",
    },
  },
  {
    timestamps: true,
  },
);

const DeliveryAgent = mongoose.model<IDeliveryAgent>(
  "DeliveryAgent",
  deliveryAgentSchema,
);

export default DeliveryAgent;
