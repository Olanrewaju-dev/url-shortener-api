import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import db from "./config/dbConfig";
import userRoutes from "./users/users.routes";
import urlRoutes from "./url/url.routes";
import { redisClient } from "./config/redisConfig";
import { rateLimiter } from "./middlewares/rateLimiter";
dotenv.config();

db.connectToMongoDB(); // connecting to db
redisClient.connect(); // connecting to redis

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(rateLimiter); // rate limiter middleware

// Parsing JSON
app.use(express.json());
// Parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Root route
app.get("/", (req: Request, res: Response) => {
  res.send("Scissor API");
});

userRoutes(app);
urlRoutes(app);

export default app;
