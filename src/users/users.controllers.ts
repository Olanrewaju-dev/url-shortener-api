import { Request, Response } from "express";
import { redisClient } from "../config/redisConfig";
// importing models
import { UrlModel } from "../url/url.model";
import { UserModel } from "./users.model";
// importing user services
import { Login, RegisterUser } from "./users.service";
// other imports
import { ObjectId } from "mongodb";
import shortId from "short-uuid";
import { validateURL, isUrlBroken } from "../utils/utils";
import dotenv from "dotenv";
dotenv.config();

// get all users handler function
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // checking if users are cached before making call to DB
    const cachedUsers = await redisClient.get("allUsers");
    if (cachedUsers) {
      res.status(200).send({
        message: "Cache hit. Users successfully retrieved.",
        data: JSON.parse(cachedUsers),
      });
      return;
    }

    // making call to DB if users are not cached
    const users = await UserModel.find({});
    if (users) {
      await redisClient.setEx("allUsers", 43200, JSON.stringify(users)); // caching the users for 12 hours
      res.status(200).send({
        message: "Users fetched successfully",
        data: users,
      });
    }
  } catch (err: any) {
    res.status(500).send({
      message: "Internal server error",
      error: err.message,
      data: [],
    });
  }
};

// get one user handler function
export const getOneUser = async (req: Request, res: Response) => {
  try {
    const userID = req.params.id;
    // checking if users are cached before making call to DB
    const cachedUser = await redisClient.get(`${userID}`);
    if (cachedUser) {
      res.status(200).send({
        message: "Cache hit. User successfully retrieved.",
        data: JSON.parse(cachedUser),
      });
      return;
    }

    // making call to DB if user is not cached
    const userRequested = await UserModel.findById({
      _id: new ObjectId(userID),
    });
    if (userRequested) {
      // caching the user if it is not already cached
      await redisClient.setEx(
        `${userID}`,
        43200,
        JSON.stringify(userRequested)
      ); // caching the user for 12 hours
      res.status(200).send({
        message: "User successfully retrieved.",
        data: userRequested,
      });
    }
  } catch (error: any) {
    res.status(404).send({
      message: "Error retrieving user",
      err: error.message,
      data: [],
    });
  }
};

// update users handler function
export const updateUser = async (req: Request, res: Response) => {
  try {
    const userID = req.params.id; // grabbing the id of the user to update
    const userToUpdate = req.body; // grabbing the body of the user to update
    const query = { _id: new ObjectId(userID) };

    const updatedUser = await UserModel.updateOne(query, {
      $set: userToUpdate,
    });

    if (updatedUser) {
      // response if update is successful
      res.status(200).send({
        message: "User updated successfully in Db",
        data: updatedUser,
      });
    }
  } catch (err: any) {
    res.status(304).send({
      message: "Server unable to update user",
      error: err.message,
      data: [],
    });
  }
};

// delete user handler function
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userID = req.params.id;
    const query = { _id: new ObjectId(userID) };
    const deletedUser = await UserModel.deleteOne(query);

    if (deletedUser) {
      res.status(200).send({
        message: `Successfully removed book with id ${userID}`,
      });
    }
  } catch (err: any) {
    res.status(400).send({
      message: err.message,
    });
  }
};

// user dashboard handler function
export const getDashboard = async (req: Request, res: Response) => {
  try {
    const urls = await UrlModel.find({ owner: res.locals.user._id });

    res.render("dashboard", {
      user: res.locals.user,
      data: urls,
    });
  } catch (error: any) {
    console.log(error.message);
  }
};

export const createFreeUrl = async (req: Request, res: Response) => {
  const origUrlFromReq = req.body.url;
  // checking for the original url in db
  const existingShortUrl = await UrlModel.findOne({
    origUrl: { $in: origUrlFromReq },
  });
  if (existingShortUrl) {
    res.render("index", { data: existingShortUrl.shortUrl });
  } else {
    // setting the base url
    const base = process.env.URL_BASE || "http://localhost:3000";
    // generating a random url id
    const urlId = shortId.generate().slice(0, 6);
    //performing a check on the original url to see if it is broken
    let urlBrokenCheck = await isUrlBroken(origUrlFromReq);

    // check if the original url is valid and not broken
    if (validateURL(origUrlFromReq) && urlBrokenCheck === false) {
      try {
        const shortUrlId = `${base}/${urlId}`;
        const newUrlObj = await UrlModel.create({
          origUrl: origUrlFromReq,
          shortUrl: shortUrlId,
          urlId,
          clicks: 0,
          date: new Date(),
        });

        res.render("index", { data: newUrlObj.shortUrl || null });
      } catch (err: any) {
        res.status(500).send({
          message: err.message,
        });
      }
    } else {
      res.status(400).send({
        message: "Invalid Original Url",
      });
    }
  }
};

// redirect to original url handler function
export const redirectToOriginalUrl = async (req: Request, res: Response) => {
  const shortId = req.params.id;
  try {
    const result = await UrlModel.findOne({ urlId: { $in: shortId } });
    if (!result) {
      res.status(404).send("Original URL not found");
    } else {
      res.redirect(result.origUrl);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// user registration handler function
export const createUser = async (req: Request, res: Response) => {
  try {
    // calling the RegisterUser function from user service
    const response = await RegisterUser({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
    });

    if (response?.code == 201) {
      // set cookie for create account
      res.cookie("jwt", response.token);
      res.redirect("/users/login");
    } else {
      res.render("signup", { message: response.message });
    }
  } catch (err: any) {
    res.send({
      message: "An error has occurred",
      error: err.message,
    });
  }
};

// user create short URL handler function
export const userCreateUrl = async (req: Request, res: Response) => {
  const origUrlPayload = req.body.url;
  // setting the base url
  const base = process.env.URL_BASE || "https://localhost:3000";
  // generating a random url id
  const urlId = shortId.generate().slice(0, 6);
  //performing a check on the original url to see if it is broken
  let urlBrokenCheck = await isUrlBroken(origUrlPayload);

  // check if the original url is valid and not broken
  if (validateURL(origUrlPayload) && urlBrokenCheck === false) {
    try {
      // check db for existing url
      let existingShortUrl = await UrlModel.findOne({
        origUrl: origUrlPayload,
      });
      if (existingShortUrl) {
        const data = {
          message: "URL already exists",
          data: existingShortUrl,
        };
        res.render("dashboard", { data: data || null });
      } else {
        let shortUrlId = `${base}${urlId}`;
        await UrlModel.create({
          origUrl: origUrlPayload,
          shortUrl: shortUrlId,
          urlId,
          clicks: 0,
          owner: res.locals.user._id,
        });
        res.redirect("/users/dashboard");
      }
    } catch (err: any) {
      res.status(500).send({
        message: err.message,
      });
    }
  } else {
    const data = {
      message: "Invalid Original Url",
      code: 400,
    };
    res.render("error", { data: data });
  }
};

// user login handler function
export const loginUser = async (req: Request, res: Response) => {
  try {
    const response = await Login({
      email: req.body.email,
      password: req.body.password,
    });
    if (response.code == 200) {
      // set cookie for user login
      res.cookie("jwt", response.data?.token);
      res.redirect("/users/dashboard");
    } else {
      const message = "Invalid email or password";
      res.render("login.ejs", { message });
    }
  } catch (error: any) {
    res.status(500).send({
      message: "An error has occurred",
      error: error.message,
    });
  }
};

// user logout handler function
export const logoutUser = async (req: Request, res: Response) => {
  try {
    res.clearCookie("jwt");
    res.redirect("/users/login");
  } catch (error: any) {
    res.status(500).send({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// POST Delete the URL
export const deleteURL = async (req: Request, res: Response) => {
  try {
    const urlId = req.params.id;
    const deletePayLoad = req.body.delete;
    if (deletePayLoad) {
      const deletedUrl = await UrlModel.findByIdAndDelete(urlId);
      if (deletedUrl) {
        res.redirect("/users/dashboard");
      }
    }
  } catch (err: any) {
    res.send({
      message: err.message,
      code: 500,
    });
  }
};
