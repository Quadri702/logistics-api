import { Queue } from "bullmq";

const shipmentQueue = new Queue("shipment-queue", {
  connection: {
    host: "127.0.0.1",
    port: 6379,
  },
  defaultJobOptions: {
    attempts: 3,
  },
});

export default shipmentQueue;
