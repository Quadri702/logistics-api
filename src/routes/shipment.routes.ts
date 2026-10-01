import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import {
  createShipment,
  getShipments,
  updateShipmentStatus,
  assignShipmentToAgent,
  updateAssignedShipmentStatus,
} from "../controllers/shipment.controller.js";

const router = Router();

router.post("/", protect, createShipment);

router.get("/", protect, getShipments);

router.patch("/:id/status", protect, updateShipmentStatus);

router.patch(
  "/:id/assign",
  protect,
  requireRole("admin"),
  assignShipmentToAgent,
);

router.patch(
  "/:id/agent-status",
  protect,
  requireRole("delivery_agent"),
  updateAssignedShipmentStatus,
);

export default router;
