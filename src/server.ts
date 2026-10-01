import "dotenv/config";
import app from "./app.js";
import connectDatabase from "./config/database.js";
import redisClient from "./config/redis.js";

const PORT = 5000;

await connectDatabase();

await redisClient.connect();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
