import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import db from "./config/dbConfig";
import userRoutes from "./users/users.routes";
import urlRoutes from "./url/url.routes";
import { redisClient } from "./config/redisConfig";
dotenv.config();

db.connectToMongoDB(); // connecting to db
redisClient.connect(); // connecting to redis

const app: Express = express();
const port = process.env.PORT || 3000;

// setting EJS as the view engine
app.set("view engine", "ejs");

// reading static files
app.use(express.static("public"));

// Parsing JSON
app.use(express.json());
// Parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// routes
userRoutes(app);
urlRoutes(app);

const shortUrl = "";
// Root route
app.get("/", (req: Request, res: Response) => {
  res.render("index.ejs", { data: shortUrl || null });
});

// export default app;
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
