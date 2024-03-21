"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.freeRateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Initialize & export rate limiter with options
exports.freeRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 2, // limit each IP to 100 requests per windowMs
    message: "Our free service is limited to 2 request every 5minutes, please try again later. You can also create an account for unlimited access",
});
