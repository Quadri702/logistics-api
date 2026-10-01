import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import {
  createDeliveryAgent,
  getAllDeliveryAgents,
} from "../controllers/deliveryAgent.controller.js";

const router = Router();

router.post("/", protect, requireRole("admin"), createDeliveryAgent);

router.get("/", protect, requireRole("admin"), getAllDeliveryAgents);

export default router;
