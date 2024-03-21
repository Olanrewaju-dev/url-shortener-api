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
Object.defineProperty(exports, "__esModule", { value: true });
exports.redirectToOriginalUrl = exports.getUrlById = void 0;
const url_model_1 = require("./url.model");
const redisConfig_1 = require("../config/redisConfig");
// GET one URL by ID
const getUrlById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const urlId = req.params.id;
        // checking if URLs are cached before making call to DB
        const cachedURL = yield redisConfig_1.redisClient.get(`${urlId}`);
        if (cachedURL) {
            res.status(200).send({
                message: "Cache hit. URL successfully retrieved.",
                data: JSON.parse(cachedURL),
            });
            return;
        }
        const url = yield url_model_1.UrlModel.findOne({ urlId: req.params.id }); // find the url by id
        if (url) {
            yield url_model_1.UrlModel.updateOne({
                urlId: req.params.id,
            }, { $inc: { clicks: 1 } } // increment the clicks by 1
            );
            yield redisConfig_1.redisClient.setEx(`${urlId}`, 43200, JSON.stringify(url)); // caching the URL for 12 hours
            res.redirect(url.origUrl);
            // res.status(200).send({
            //   message: "Original url retrieved successfully",
            //   data: url,
            // });
        }
        else {
            res.status(404).send({
                message: "URL not found in the database",
                data: [],
            });
        }
    }
    catch (err) {
        res.status(500).send({
            message: err.message,
        });
    }
});
exports.getUrlById = getUrlById;
const redirectToOriginalUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const shortCode = req.params.shortCode;
    console.log("i got here - redirectToOrignalUrl");
    try {
        const shortUrl = yield url_model_1.UrlModel.findOne({ shortCode });
        if (!shortUrl) {
            return res.status(404).send("Short URL not found");
        }
        return res.redirect(shortUrl.origUrl);
    }
    catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
});
exports.redirectToOriginalUrl = redirectToOriginalUrl;
