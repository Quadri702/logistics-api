import "dotenv/config";
import { createServer } from "node:http";
import mongoose from "mongoose";
import app from "./app.js";
import connectDatabase from "./config/database.js";
import redisClient from "./config/redis.js";
import { initializeSocket } from "./config/socket.js";
import shipmentQueue from "./queues/queue.shipment.js";
import shipmentWorker from "./workers/shipment.worker.js";

const PORT = Number(process.env.PORT) || 5000;

await connectDatabase();
await redisClient.connect();

const httpServer = createServer(app);

const io = initializeSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

let isShuttingDown = false;

const shutdown = (signal: NodeJS.Signals): void => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  console.log(`${signal} received. Starting graceful shutdown...`);

  io.close(async () => {
    try {
      await shipmentWorker.close();
      console.log("Shipment worker closed");

      await shipmentQueue.close();
      console.log("Shipment queue closed");

      if (redisClient.isOpen) {
        await redisClient.quit();
        console.log("Redis connection closed");
      }

      await mongoose.disconnect();
      console.log("MongoDB connection closed");

      console.log("Graceful shutdown complete");
      process.exit(0);
    } catch (error) {
      console.error("Error during graceful shutdown:", error);
      process.exit(1);
    }
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
