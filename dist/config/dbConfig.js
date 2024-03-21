"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
require("dotenv").config();
const MONGODB_URI = process.env.MONGODB_URI;
// connect to mongodb
function connectToMongoDB() {
    mongoose_1.default.connect(MONGODB_URI || "", {
        dbName: process.env.DB_NAME,
    });
    mongoose_1.default.connection.on("connected", () => {
        console.log("Connected to MongoDB successfully");
    });
    mongoose_1.default.connection.on("error", (err) => {
        console.log("Error connecting to MongoDB", err);
        process.exit(1);
    });
}
exports.default = { connectToMongoDB };
