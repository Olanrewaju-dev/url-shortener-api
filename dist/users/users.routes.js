"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const usersController = __importStar(require("./users.controllers"));
const inputValidator_1 = require("../middlewares/inputValidator");
const authJWT_1 = require("../middlewares/authJWT");
const rateLimiter_1 = require("../middlewares/rateLimiter");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
function userRoutes(app) {
    // cookie parser
    app.use((0, cookie_parser_1.default)());
    // create a short URL from the homepage
    app.post("/", rateLimiter_1.freeRateLimiter, usersController.createFreeUrl);
    // GET get all users
    app.get("/users", authJWT_1.getCookie, usersController.getAllUsers);
    // POST create a user in the database
    app.post("/users/signup", inputValidator_1.createUserValidator, usersController.createUser);
    // POST login a user
    app.post("/users/login", inputValidator_1.loginUserValidator, usersController.loginUser);
    // GET dashboard
    app.get("/users/dashboard", authJWT_1.getCookie, usersController.getDashboard);
    // POST a user creates new shortened URL
    app.post("/users/dashboard", authJWT_1.getCookie, usersController.userCreateUrl);
    // GET login page
    app.get("/users/login", (req, res) => {
        res.render("login.ejs");
    });
    // signup page
    app.get("/users/signup", (req, res) => {
        res.render("signup.ejs");
    });
    // logout user
    app.get("/users/logout", authJWT_1.getCookie, usersController.logoutUser);
    // POST delete a user
    app.post("/users/dashboard/:id", authJWT_1.getCookie, usersController.deleteURL);
    // redirector route
    app.get("/:id", usersController.redirectToOriginalUrl);
    // get one user
    app.get("/users/:id", usersController.getOneUser);
    // put/update a user
    app.put("/users/:id", usersController.updateUser);
    // delete a user
    app.delete("/users/:id", usersController.deleteUser);
}
exports.default = userRoutes;
