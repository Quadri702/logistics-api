import type { Server as HTTPServer } from "node:http";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import Shipment from "../models/shipment.model.js";

let io: Server;

export const initializeSocket = (server: HTTPServer): Server => {
  io = new Server(server);

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      next(new Error("Authentication required"));
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

      const payload = decoded as {
        id: string;
        role: string;
      };

      socket.data.userId = payload.id;
      socket.data.role = payload.role;

      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("joinShipment", async (shipmentId: string) => {
      try {
        const userId = socket.data.userId;
        const role = socket.data.role;

        const shipment = await Shipment.findOne({
          _id: shipmentId,
          $or: [{ customer: userId }, { deliveryAgent: userId }],
        });

        if (!shipment && role !== "ADMIN") {
          socket.emit("shipmentAccessDenied", {
            message: "You are not authorized to view this shipment",
          });

          return;
        }

        const room = `shipment:${shipmentId}`;

        socket.join(room);

        console.log(`Socket ${socket.id} joined shipment room ${room}`);

        socket.emit("shipmentJoined", {
          shipmentId,
        });
      } catch (error) {
        console.error("Error joining shipment room:", error);

        socket.emit("shipmentAccessDenied", {
          message: "Unable to access shipment",
        });
      }
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }

  return io;
};
