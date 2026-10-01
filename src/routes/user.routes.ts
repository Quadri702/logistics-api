import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import {
  getAllUsers,
  getUser,
  updateUserRole,
} from "../controllers/user.controller.js";

const router = Router();

router.get("/", protect, requireRole("admin"), getAllUsers);
router.get("/:id", protect, requireRole("admin"), getUser);
router.patch("/:id/role", protect, requireRole("admin"), updateUserRole);

export default router;
