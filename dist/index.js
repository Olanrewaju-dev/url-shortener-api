"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const dbConfig_1 = __importDefault(require("./config/dbConfig"));
const users_routes_1 = __importDefault(require("./users/users.routes"));
const redisConfig_1 = require("./config/redisConfig");
dotenv_1.default.config();
dbConfig_1.default.connectToMongoDB(); // connecting to db
redisConfig_1.redisClient.connect(); // connecting to redis
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// setting EJS as the view engine
app.set("view engine", "ejs");
// reading static files
app.use(express_1.default.static("public"));
// Parsing JSON
app.use(express_1.default.json());
// Parsing application/x-www-form-urlencoded
app.use(express_1.default.urlencoded({ extended: true }));
// routes
(0, users_routes_1.default)(app);
const shortUrl = "";
// Root route
app.get("/", (req, res) => {
    res.render("index.ejs", { data: shortUrl || null });
});
// export default app;
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
