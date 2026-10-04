import "dotenv/config";
import { createServer } from "node:http";
import app from "./app.js";
import connectDatabase from "./config/database.js";
import redisClient from "./config/redis.js";
import { initializeSocket } from "./config/socket.js";

const PORT = 5000;

await connectDatabase();
await redisClient.connect();

const httpServer = createServer(app);

initializeSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
