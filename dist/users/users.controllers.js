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
exports.deleteURL = exports.logoutUser = exports.loginUser = exports.userCreateUrl = exports.createUser = exports.redirectToOriginalUrl = exports.createFreeUrl = exports.getDashboard = exports.deleteUser = exports.updateUser = exports.getOneUser = exports.getAllUsers = void 0;
const redisConfig_1 = require("../config/redisConfig");
// importing models
const url_model_1 = require("../url/url.model");
const users_model_1 = require("./users.model");
// importing user services
const users_service_1 = require("./users.service");
// other imports
const mongodb_1 = require("mongodb");
const short_uuid_1 = __importDefault(require("short-uuid"));
const utils_1 = require("../utils/utils");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// get all users handler function
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // checking if users are cached before making call to DB
        const cachedUsers = yield redisConfig_1.redisClient.get("allUsers");
        if (cachedUsers) {
            res.status(200).send({
                message: "Cache hit. Users successfully retrieved.",
                data: JSON.parse(cachedUsers),
            });
            return;
        }
        // making call to DB if users are not cached
        const users = yield users_model_1.UserModel.find({});
        if (users) {
            yield redisConfig_1.redisClient.setEx("allUsers", 43200, JSON.stringify(users)); // caching the users for 12 hours
            res.status(200).send({
                message: "Users fetched successfully",
                data: users,
            });
        }
    }
    catch (err) {
        res.status(500).send({
            message: "Internal server error",
            error: err.message,
            data: [],
        });
    }
});
exports.getAllUsers = getAllUsers;
// get one user handler function
const getOneUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userID = req.params.id;
        // checking if users are cached before making call to DB
        const cachedUser = yield redisConfig_1.redisClient.get(`${userID}`);
        if (cachedUser) {
            res.status(200).send({
                message: "Cache hit. User successfully retrieved.",
                data: JSON.parse(cachedUser),
            });
            return;
        }
        // making call to DB if user is not cached
        const userRequested = yield users_model_1.UserModel.findById({
            _id: new mongodb_1.ObjectId(userID),
        });
        if (userRequested) {
            // caching the user if it is not already cached
            yield redisConfig_1.redisClient.setEx(`${userID}`, 43200, JSON.stringify(userRequested)); // caching the user for 12 hours
            res.status(200).send({
                message: "User successfully retrieved.",
                data: userRequested,
            });
        }
    }
    catch (error) {
        res.status(404).send({
            message: "Error retrieving user",
            err: error.message,
            data: [],
        });
    }
});
exports.getOneUser = getOneUser;
// update users handler function
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userID = req.params.id; // grabbing the id of the user to update
        const userToUpdate = req.body; // grabbing the body of the user to update
        const query = { _id: new mongodb_1.ObjectId(userID) };
        const updatedUser = yield users_model_1.UserModel.updateOne(query, {
            $set: userToUpdate,
        });
        if (updatedUser) {
            // response if update is successful
            res.status(200).send({
                message: "User updated successfully in Db",
                data: updatedUser,
            });
        }
    }
    catch (err) {
        res.status(304).send({
            message: "Server unable to update user",
            error: err.message,
            data: [],
        });
    }
});
exports.updateUser = updateUser;
// delete user handler function
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userID = req.params.id;
        const query = { _id: new mongodb_1.ObjectId(userID) };
        const deletedUser = yield users_model_1.UserModel.deleteOne(query);
        if (deletedUser) {
            res.status(200).send({
                message: `Successfully removed book with id ${userID}`,
            });
        }
    }
    catch (err) {
        res.status(400).send({
            message: err.message,
        });
    }
});
exports.deleteUser = deleteUser;
// user dashboard handler function
const getDashboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const urls = yield url_model_1.UrlModel.find({ owner: res.locals.user._id });
        res.render("dashboard", {
            user: res.locals.user,
            data: urls,
        });
    }
    catch (error) {
        console.log(error.message);
    }
});
exports.getDashboard = getDashboard;
const createFreeUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const origUrlFromReq = req.body.url;
    // checking for the original url in db
    const existingShortUrl = yield url_model_1.UrlModel.findOne({
        origUrl: { $in: origUrlFromReq },
    });
    if (existingShortUrl) {
        console.log("Original url already exist");
        res.render("index", { data: existingShortUrl.shortUrl || null });
    }
    else {
        // setting the base url
        const base = process.env.URL_BASE;
        // generating a random url id
        const urlId = short_uuid_1.default.generate().slice(0, 6);
        //performing a check on the original url to see if it is broken
        let urlBrokenCheck = yield (0, utils_1.isUrlBroken)(origUrlFromReq);
        // check if the original url is valid and not broken
        if ((0, utils_1.validateURL)(origUrlFromReq) && urlBrokenCheck === false) {
            try {
                const shortUrl = `${base}/${urlId}`;
                const newUrlObj = yield url_model_1.UrlModel.create({
                    origUrlFromReq,
                    shortUrl,
                    urlId,
                    clicks: 0,
                    date: new Date(),
                });
                res.render("index", { data: newUrlObj.shortUrl || null });
            }
            catch (err) {
                res.status(500).send({
                    message: err.message,
                });
            }
        }
        else {
            res.status(400).send({
                message: "Invalid Original Url",
            });
        }
    }
});
exports.createFreeUrl = createFreeUrl;
// redirect to original url handler function
const redirectToOriginalUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { redirectToOrigUrl } = req.params;
    console.log("i got here - redirectToOrignalUrl");
    try {
        const shortUrl = yield url_model_1.UrlModel.findOne({ urlId: { redirectToOrigUrl } });
        if (!shortUrl) {
            res.status(404).send("Original URL not found");
        }
        if (shortUrl !== null) {
            res.redirect(shortUrl.origUrl);
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});
exports.redirectToOriginalUrl = redirectToOriginalUrl;
// user registration handler function
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // calling the RegisterUser function from user service
        const response = yield (0, users_service_1.RegisterUser)({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
        });
        if ((response === null || response === void 0 ? void 0 : response.code) == 201) {
            // set cookie for create account
            res.cookie("jwt", response.token);
            res.redirect("/users/login");
        }
        else {
            res.render("signup", { message: response.message });
        }
    }
    catch (err) {
        res.send({
            message: "An error has occurred",
            error: err.message,
        });
    }
});
exports.createUser = createUser;
// user create short URL handler function
const userCreateUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const origUrl = req.body.url;
    // setting the base url
    const base = process.env.URL_BASE || "https://localhost:3000";
    // generating a random url id
    const urlId = short_uuid_1.default.generate().slice(0, 6);
    //performing a check on the original url to see if it is broken
    let urlBrokenCheck = yield (0, utils_1.isUrlBroken)(origUrl);
    // check if the original url is valid and not broken
    if ((0, utils_1.validateURL)(origUrl) && urlBrokenCheck === false) {
        try {
            // check db for existing url
            let existingShortUrl = yield url_model_1.UrlModel.findOne({ origUrl });
            if (existingShortUrl) {
                const data = {
                    message: "URL already exists",
                    data: existingShortUrl,
                };
                res.render("dashboard", { data: data || null });
            }
            else {
                let shortUrl = `${base}/${urlId}`;
                const newUrlObj = yield url_model_1.UrlModel.create({
                    origUrl,
                    shortUrl,
                    urlId,
                    clicks: 0,
                    owner: res.locals.user._id,
                });
                res.redirect("/users/dashboard");
            }
        }
        catch (err) {
            res.status(500).send({
                message: err.message,
            });
        }
    }
    else {
        const data = {
            message: "Invalid Original Url",
            code: 400,
        };
        res.render("error", { data: data });
    }
});
exports.userCreateUrl = userCreateUrl;
// user login handler function
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const response = yield (0, users_service_1.Login)({
            email: req.body.email,
            password: req.body.password,
        });
        if (response.code == 200) {
            // set cookie for user login
            res.cookie("jwt", (_a = response.data) === null || _a === void 0 ? void 0 : _a.token);
            res.redirect("/users/dashboard");
        }
        else {
            const message = "Invalid email or password";
            res.render("login.ejs", { message });
        }
    }
    catch (error) {
        res.status(500).send({
            message: "An error has occurred",
            error: error.message,
        });
    }
});
exports.loginUser = loginUser;
// user logout handler function
const logoutUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.clearCookie("jwt");
        res.redirect("/users/login");
    }
    catch (error) {
        res.status(500).send({
            message: "Internal server error",
            error: error.message,
        });
    }
});
exports.logoutUser = logoutUser;
// POST Delete the URL
const deleteURL = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const urlId = req.params.id;
        const deletePayLoad = req.body.delete;
        if (deletePayLoad) {
            const deletedUrl = yield url_model_1.UrlModel.findByIdAndDelete(urlId);
            if (deletedUrl) {
                res.redirect("/users/dashboard");
            }
        }
    }
    catch (err) {
        res.send({
            message: err.message,
            code: 500,
        });
    }
});
exports.deleteURL = deleteURL;
