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
exports.isUrlBroken = exports.validateURL = void 0;
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
function validateURL(value) {
    return __awaiter(this, void 0, void 0, function* () {
        const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
        const result = yield urlRegex.test(value);
        console.log("URL validation result:", result);
        return result;
    });
}
exports.validateURL = validateURL;
// validate user provided url is not broken
function isUrlBroken(url) {
    return __awaiter(this, void 0, void 0, function* () {
        // Determine the module to use based on the URL protocol
        const client = url.startsWith("https") ? https_1.default : http_1.default;
        try {
            const response = yield new Promise((resolve, reject) => {
                const request = client.get(url, resolve);
                request.on("error", reject);
                request.setTimeout(5000, () => {
                    request.abort();
                    reject(new Error("Request timed out"));
                });
            });
            // Check the response status code
            return !(response.statusCode &&
                response.statusCode >= 200 &&
                response.statusCode < 400);
        }
        catch (err) {
            console.error("Error checking URL:", err.message || err);
            return true; // Error occurred, so URL is considered broken
        }
    });
}
exports.isUrlBroken = isUrlBroken;
