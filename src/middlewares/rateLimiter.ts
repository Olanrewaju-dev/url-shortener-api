import rateLimit from "express-rate-limit";

// Initialize & export rate limiter with options
export const freeRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 2, // limit each IP to 100 requests per windowMs
  message:
    "Our free service is limited to 2 request every 5minutes, please try again later. You can also create an account for unlimited access",
});
