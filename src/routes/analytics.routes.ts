import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import {
  getShipmentAnalytics,
  getPaymentAnalytics,
  getDeliveryAgentAnalytics,
} from "../controllers/analytics.controller.js";

const router = Router();

router.get("/shipments", protect, requireRole("admin"), getShipmentAnalytics);
router.get("/payments", protect, requireRole("admin"), getPaymentAnalytics);
router.get(
  "/delivery-agents",
  protect,
  requireRole("admin"),
  getDeliveryAgentAnalytics,
);

export default router;
