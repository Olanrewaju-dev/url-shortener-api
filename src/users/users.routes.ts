import { Express } from "express";
import * as usersController from "./users.controllers";
import {
  createUserValidator,
  loginUserValidator,
} from "../middlewares/inputValidator";
import { getCookie } from "../middlewares/authJWT";
import { freeRateLimiter } from "../middlewares/rateLimiter";
import cookieParser from "cookie-parser";

function userRoutes(app: Express) {
  // cookie parser
  app.use(cookieParser());

  // create a short URL from the homepage
  app.post("/", freeRateLimiter, usersController.createFreeUrl);

  // redirector route
  app.get("/:id", usersController.redirectToOriginalUrl);

  // GET get all users
  app.get("/users", getCookie, usersController.getAllUsers);

  // POST create a user in the database
  app.post("/users/signup", createUserValidator, usersController.createUser);

  // POST login a user
  app.post("/users/login", loginUserValidator, usersController.loginUser);

  // GET dashboard
  app.get("/users/dashboard", getCookie, usersController.getDashboard);

  // POST a user creates new shortened URL
  app.post("/users/dashboard", getCookie, usersController.userCreateUrl);

  // POST delete a user
  app.post("/users/dashboard/:id", getCookie, usersController.deleteURL);

  // GET login page
  app.get("/users/login", (req, res) => {
    res.render("login.ejs");
  });

  // signup page
  app.get("/users/signup", (req, res) => {
    res.render("signup.ejs");
  });

  // logout user
  app.get("/users/logout", getCookie, usersController.logoutUser);

  // get one user
  app.get("/users/:id", usersController.getOneUser);

  // put/update a user
  app.put("/users/:id", usersController.updateUser);

  // delete a user
  app.delete("/users/:id", usersController.deleteUser);
}

export default userRoutes;
