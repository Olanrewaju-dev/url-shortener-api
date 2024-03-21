import { createClient } from "redis";
require("dotenv").config();

export const redisClient = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: 18017,
  },
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

redisClient.on("connect", () => console.log("Redis Client Connected"));
