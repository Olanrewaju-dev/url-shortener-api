"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cookieValidation = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv").config();
const cookieValidation = (req, res, next) => {
    const userCookie = req.cookies.jwt;
    if (!userCookie) {
        return res.status(401).json({ message: "User cookie is missing" });
    }
    // Verify the user cookie
    try {
        const decodedCookie = jsonwebtoken_1.default.verify(userCookie, process.env.JWT_SECRET || "");
        res.locals.user = decodedCookie;
        next();
    }
    catch (error) {
        return res.status(401).json({
            message: "Invalid user cookie",
            error: error.message,
        });
    }
};
exports.cookieValidation = cookieValidation;
