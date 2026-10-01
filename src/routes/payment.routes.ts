import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  initializePayment,
  verifyPayment,
} from "../controllers/payment.controller.js";

const router = Router();

router.post("/initialize/:shipmentId", protect, initializePayment);

router.get("/verify/:reference", protect, verifyPayment);

export default router;
