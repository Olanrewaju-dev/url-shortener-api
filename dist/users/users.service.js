"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterUser = exports.Login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const users_model_1 = require("./users.model");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// User login services
const Login = (_a) => __awaiter(void 0, [_a], void 0, function* ({ email, password }) {
    const userLoginDetail = { email, password };
    const user = yield users_model_1.UserModel.findOne({ email: userLoginDetail.email }); // checking db for user provided email address
    if (!user) {
        return {
            message: "User not found.", // handling error if email not found.
            code: 404,
        };
    }
    const userPassword = yield user.isValidPassword(userLoginDetail.password); // unhashing password and comparing with one in the db
    if (!userPassword) {
        return {
            message: "Email or password not correct!", // handling error if password not found.
            code: 401,
        };
    }
    const token = yield jsonwebtoken_1.default.sign({ email: user.email, _id: user._id, username: user.username }, // signing jwt token for user login
    process.env.JWT_SECRET || "", { expiresIn: "1h" });
    return {
        message: "Login successful",
        code: 200,
        data: {
            user,
            token,
        },
    };
});
exports.Login = Login;
const RegisterUser = (_b) => __awaiter(void 0, [_b], void 0, function* ({ email, password, username, }) {
    try {
        const newUserInput = { email, password, username };
        console.log(newUserInput);
        console.log("I got here");
        // checking if user already exist
        const dbCheck = yield users_model_1.UserModel.findOne({
            email: newUserInput.email,
        });
        // handling error if user email already exists.
        if (dbCheck) {
            return {
                message: "User already exist",
                code: 409,
            };
        }
        // creating user into mongodb database
        const newUserObject = yield users_model_1.UserModel.create({
            username: newUserInput.username,
            email: newUserInput.email,
            password: newUserInput.password,
        });
        if (newUserObject) {
            const token = jsonwebtoken_1.default.sign({ email: newUserObject.email }, process.env.JWT_SECRET || "", { expiresIn: "2h" });
            console.log("registration successful and jwt signed");
            return {
                message: "User registration successful",
                code: 201,
                newUserObject,
                token,
            };
        }
        return {
            message: "User registration failed", // handling error if user creation failed.
            code: 500,
        };
    }
    catch (err) {
        throw new Error(err.message);
    }
});
exports.RegisterUser = RegisterUser;
