import { Express } from "express";
import * as usersController from "./users.controllers";
import {
  createUserValidator,
  loginUserValidator,
} from "../middlewares/inputValidator";

function userRoutes(app: Express) {
  // get all users
  app.get("/users", usersController.getAllUsers);

  // create a user in the database
  app.post("/users", createUserValidator, usersController.createUser);

  // login a user
  app.post("/users/login", loginUserValidator, usersController.loginUser);

  // logout user
  app.post("/users/logout", usersController.logoutUser);

  // get one user
  app.get("/users/:id", usersController.getOneUser);

  // put/update a user
  app.put("/users/:id", usersController.updateUser);

  // delete a user
  app.delete("/users/:id", usersController.deleteUser);
}

export default userRoutes;
