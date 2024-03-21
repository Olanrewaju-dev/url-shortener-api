"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
const redis_1 = require("redis");
require("dotenv").config();
exports.redisClient = (0, redis_1.createClient)({
    socket: {
        port: parseInt(process.env.REDIS_PORT || "6379"),
    },
});
exports.redisClient.on("error", (err) => console.log("Redis Client Error", err));
exports.redisClient.on("connect", () => console.log("Redis Client Connected"));
