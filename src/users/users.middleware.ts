import jwt from "jsonwebtoken";
require("dotenv").config();
import { Request, Response, NextFunction } from "express";

export const cookieValidation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userCookie = req.cookies.jwt;

  if (!userCookie) {
    return res.status(401).json({ message: "User cookie is missing" });
  }

  // Verify the user cookie
  try {
    const decodedCookie = jwt.verify(userCookie, process.env.JWT_SECRET || "");
    res.locals.user = decodedCookie;
    next();
  } catch (error: any) {
    return res.status(401).json({
      message: "Invalid user cookie",
      error: error.message,
    });
  }
};
