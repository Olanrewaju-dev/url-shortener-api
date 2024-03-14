import rateLimit from "express-rate-limit";

// Initialize & export rate limiter with options
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 9, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
