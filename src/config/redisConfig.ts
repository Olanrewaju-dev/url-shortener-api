import { createClient } from "redis";
require("dotenv").config();

// connect to redis Client in production
// export const redisClient = createClient({
//   password: process.env.REDIS_PASSWORD,
//   socket: {
//     host: process.env.REDIS_HOST,
//     port: 18017,
//   },
// });

export const redisClient = createClient();

redisClient.on("error", (err) => console.log("Redis Client Error", err));

redisClient.on("connect", () => console.log("Redis Client Connected"));
