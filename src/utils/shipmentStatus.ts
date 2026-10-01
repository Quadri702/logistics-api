import type { ShipmentStatus } from "../models/shipment.model.js";

const allowedTransitions: Record<ShipmentStatus, ShipmentStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],

  CONFIRMED: ["ASSIGNED", "CANCELLED"],

  ASSIGNED: ["PICKED_UP"],

  PICKED_UP: ["IN_TRANSIT"],

  IN_TRANSIT: ["OUT_FOR_DELIVERY"],

  OUT_FOR_DELIVERY: ["DELIVERED", "DELIVERY_FAILED"],

  DELIVERED: [],

  DELIVERY_FAILED: ["RESCHEDULED"],

  RESCHEDULED: ["OUT_FOR_DELIVERY"],

  CANCELLED: [],
};

export const isValidStatusTransition = (
  currentStatus: ShipmentStatus,
  newStatus: ShipmentStatus,
): boolean => {
  return allowedTransitions[currentStatus].includes(newStatus);
};
