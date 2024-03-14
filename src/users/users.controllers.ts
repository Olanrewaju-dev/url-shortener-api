import { Request, Response } from "express";
import { UserModel } from "./users.model";
import { Login, RegisterUser } from "./users.service";
import { ObjectId } from "mongodb";
import { redisClient } from "../config/redisConfig";

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
      res.cookie("jwt", response.token);
      res.status(201).send({
        message: response.message,
        data: response.newUserObject,
      });
    }
  } catch (err: any) {
    res.send({
      message: "An error has occurred",
      error: err.message,
    });
  }
};

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

// user login handler function
export const loginUser = async (req: Request, res: Response) => {
  try {
    const response = await Login({
      email: req.body.email,
      password: req.body.password,
    });
    if (response.code == 200) {
      res.cookie("jwt", response.data?.token);
      console.log("user login successful", response.data?.token);
      res.send({
        message: response.message,
        status: response.code,
      });
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
    res.status(200).send({
      message: "User logged out successfully",
    });
  } catch (error: any) {
    res.status(500).send({
      message: "Internal server error",
      error: error.message,
    });
  }
};
