import app from "./index";
import db from "./config/dbConfig";
import redisClient from "./config/redisConfig";

db.connectToMongoDB(); // connecting to db
redisClient.connect(); // connecting to redis

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
