"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrlModel = void 0;
const mongoose_1 = require("mongoose");
// Define the URL schema
const UrlSchema = new mongoose_1.Schema({
    shortUrl: { type: String, required: true },
    urlId: { type: String, required: true },
    origUrl: { type: String, required: true },
    clicks: { type: Number, required: true, default: 0 },
    createdAt: { type: Date, default: Date.now },
    owner: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "users",
    },
});
// Create and export the URL model
exports.UrlModel = (0, mongoose_1.model)("Url", UrlSchema);
