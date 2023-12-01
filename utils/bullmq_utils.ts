import { Queue, Worker } from "bullmq";
import { Log } from "./db_utils";

export let LogsQueue: Queue;
export default function BullMQInit() {
  LogsQueue = new Queue("logQueue", {
    connection: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT!),
      password: process.env.REDIS_PASS,
    },
  });
}

export function SetUpWorker() {
  const worker = new Worker(
    "logQueue",
    async (job) => {
      Log.create(job.data);
      return Promise.resolve();
    },
    {
      connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT!),
        password: process.env.REDIS_PASS,
      },
    }
  );
  return worker;
}
