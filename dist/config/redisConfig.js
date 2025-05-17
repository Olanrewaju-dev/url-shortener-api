"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
const redis_1 = require("redis");
require("dotenv").config();
// connect to redis Client in production
// export const redisClient = createClient({
//   password: process.env.REDIS_PASSWORD,
//   socket: {
//     host: process.env.REDIS_HOST,
//     port: 18017,
//   },
// });
exports.redisClient = (0, redis_1.createClient)();
exports.redisClient.on("error", (err) => console.log("Redis Client Error", err));
exports.redisClient.on("connect", () => console.log("Redis Client Connected"));
