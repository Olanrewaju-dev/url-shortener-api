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
exports.loginUserValidator = exports.createUserValidator = void 0;
const joi_1 = __importDefault(require("joi"));
const createUserValidator = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const schema = joi_1.default.object({
            email: joi_1.default.string().email().required(),
            password: joi_1.default.string().min(6).required(),
            username: joi_1.default.string().min(6).required(),
        });
        const value = yield schema.validateAsync(req.body, {
            abortEarly: true,
            allowUnknown: true,
        });
        next();
    }
    catch (err) {
        res.status(500).send({
            message: err.message,
        });
    }
});
exports.createUserValidator = createUserValidator;
const loginUserValidator = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const schema = joi_1.default.object({
            email: joi_1.default.string().email().required(),
            password: joi_1.default.string().min(6).required(),
        });
        yield schema.validateAsync(req.body, {
            abortEarly: true,
            allowUnknown: true,
        });
        next();
    }
    catch (err) {
        res.status(500).send({
            message: err.message,
        });
    }
});
exports.loginUserValidator = loginUserValidator;
