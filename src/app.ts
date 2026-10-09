import express from "express";
import authRoutes from "./routes/auth.routes.js";
import { protect } from "./middlewares/auth.middleware.js";
import type { AuthenticatedRequest } from "./middlewares/auth.middleware.js";
import { requireRole } from "./middlewares/role.middleware.js";
import userRoutes from "./routes/user.routes.js";
import shipmentRoutes from "./routes/shipment.routes.js";
import deliveryAgentRoutes from "./routes/deliveryAgent.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import analyticsRouter from "./routes/analytics.routes.js";
import { globalErrorHandler } from "./middlewares/error.middleware.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";

const app = express();

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(
  express.json({
    verify: (req, _res, buf) => {
      (
        req as typeof req & {
          rawBody?: Buffer;
        }
      ).rawBody = Buffer.from(buf);
    },
  }),
);

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Logistics API is running",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
  });
});

app.use("/api/auth", authRoutes);

app.get("/api/protected", protect, (req: AuthenticatedRequest, res) => {
  res.status(200).json({
    status: "success",
    message: "You accessed a protected route",
    userId: req.userId,
    role: req.userRole,
  });
});

app.get(
  "/api/admin-test",
  protect,
  requireRole("admin"),
  (req: AuthenticatedRequest, res) => {
    res.status(200).json({
      status: "success",
      message: "You are an admin",
    });
  },
);

app.get(
  "/api/customer-test",
  protect,
  requireRole("customer"),
  (req: AuthenticatedRequest, res) => {
    res.status(200).json({
      status: "success",
      message: "Customer access granted",
    });
  },
);

app.get(
  "/api/agent-test",
  protect,
  requireRole("delivery_agent"),
  (req: AuthenticatedRequest, res) => {
    res.status(200).json({
      status: "success",
      message: "Delivery agent access granted",
    });
  },
);

app.get(
  "/api/operations-test",
  protect,
  requireRole("admin", "delivery_agent"),
  (req: AuthenticatedRequest, res) => {
    res.status(200).json({
      status: "success",
      message: "Operations access granted",
    });
  },
);

app.use("/api/users", userRoutes);
app.use("/api/shipments", shipmentRoutes);
app.use("/api/delivery-agents", deliveryAgentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRouter);
app.use((req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});
app.use(globalErrorHandler);

export default app;
