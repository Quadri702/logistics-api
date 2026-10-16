
import { Worker } from "bullmq";

const redisUrl = new URL(
  process.env.REDIS_URL || "redis://127.0.0.1:6379",
);

const connection = {
  host: redisUrl.hostname,
  port: Number(redisUrl.port || 6379),
  ...(redisUrl.username
    ? { username: decodeURIComponent(redisUrl.username) }
    : {}),
  ...(redisUrl.password
    ? { password: decodeURIComponent(redisUrl.password) }
    : {}),
  ...(redisUrl.protocol === "rediss:" ? { tls: {} } : {}),
  maxRetriesPerRequest: null,
};

const shipmentWorker = new Worker(
  "shipment-queue",
  async (job) => {
    const { shipmentId, customerId } = job.data;

    console.log("Processing shipment notification");
    console.log("Shipment ID:", shipmentId);
    console.log("Customer ID:", customerId);

    console.log(
      `Notification: Shipment ${shipmentId} has been created for customer ${customerId}`,
    );
  },
  { connection },
);

shipmentWorker.on("ready", () => {
  console.log("Shipment worker is ready");
});

shipmentWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

shipmentWorker.on("failed", (job, error) => {
  console.error(
    `Job ${job?.id} failed after ${job?.attemptsMade} attempts:`,
    error.message,
  );
});

shipmentWorker.on("error", (error) => {
  console.error("Worker error:", error);
});

await shipmentWorker.waitUntilReady();

console.log("Worker process is running");

export default shipmentWorker;

