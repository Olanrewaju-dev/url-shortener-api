import jwt from "jsonwebtoken";
import { UserModel } from "./users.model";
require("dotenv").config();

interface LoginUserParams {
  email: string;
  password: string;
}

// User login services
export const Login = async ({ email, password }: LoginUserParams) => {
  const userLoginDetail = { email, password };

  const user = await UserModel.findOne({ email: userLoginDetail.email }); // checking db for user provided email address

  if (!user) {
    return {
      message: "User not found.", // handling error if email not found.
      code: 404,
    };
  }

  const userPassword = await user.isValidPassword(userLoginDetail.password); // unhashing password and comparing with one in the db

  if (!userPassword) {
    return {
      message: "Email or password not correct!", // handling error if password not found.
      code: 401,
    };
  }

  const token = await jwt.sign(
    { email: user.email, _id: user._id, username: user.username }, // signing jwt token for user login
    process.env.JWT_SECRET || "",
    { expiresIn: "1h" }
  );

  return {
    message: "Login successful",
    code: 200,
    data: {
      user,
      token,
    },
  };
};

// User registration services
interface RegisterUserParams {
  email: string;
  password: string;
  username: string;
}

export const RegisterUser = async ({
  email,
  password,
  username,
}: RegisterUserParams) => {
  try {
    const newUserInput = { email, password, username };

    // checking if user already exist
    const dbCheck = await UserModel.findOne({
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
    const newUserObject = await UserModel.create({
      username: newUserInput.username,
      email: newUserInput.email,
      password: newUserInput.password,
    });

    if (newUserObject) {
      const token = jwt.sign(
        { email: newUserObject.email },
        process.env.JWT_SECRET || "",
        { expiresIn: "2h" }
      );
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
  } catch (err: any) {
    throw new Error(err.message);
  }
};
