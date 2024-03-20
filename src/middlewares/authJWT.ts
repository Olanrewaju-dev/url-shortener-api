import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const getCookie = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.jwt;

  if (token) {
    const decodedValue = await jwt.verify(token, process.env.JWT_SECRET || "");

    res.locals.user = decodedValue;
    next();
  } else {
    res.redirect("/users/login");
  }
};
