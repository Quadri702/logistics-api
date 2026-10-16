import { Worker } from "bullmq";

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
  {
    connection: {
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: 6379,
    },
  },
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
