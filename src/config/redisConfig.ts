import { createClient } from "redis";
require("dotenv").config();

export const redisClient = createClient({
  socket: {
    port: parseInt(process.env.REDIS_PORT || "6379"),
  },
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

redisClient.on("connect", () => console.log("Redis Client Connected"));
