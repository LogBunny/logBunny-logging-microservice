import { RedisClientType } from "@redis/client";
import { createClient } from "redis";

export let RedisClient: RedisClientType;
export let PubSub: RedisClientType;
export default async function RedisInit() {
  RedisClient = createClient({
    password: process.env.REDIS_PASS,
    socket: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT!),
    },
  });
  PubSub = RedisClient.duplicate();
  await PubSub.connect();
  await RedisClient.connect();

  RedisClient.on("connect", () => console.log("Redis connected"));
  RedisClient.on("error", (err) => console.error("Redis connection failed"));
  RedisClient.on("end", () => console.log("Redis stopped"));

  PubSub.on("connect", () => console.log("PubSub connected"));
  PubSub.on("error", (err) => console.error("PubSub connection failed"));
  PubSub.on("end", () => console.log("PubSub stopped"));
}
