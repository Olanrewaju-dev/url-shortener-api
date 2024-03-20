import Joi from "joi";
import { Request, Response, NextFunction } from "express";

export const createUserValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      username: Joi.string().min(6).required(),
    });

    const value = await schema.validateAsync(req.body, {
      abortEarly: true,
      allowUnknown: true,
    });

    next();
  } catch (err: any) {
    res.status(500).send({
      message: err.message,
    });
  }
};

export const loginUserValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
    });

    await schema.validateAsync(req.body, {
      abortEarly: true,
      allowUnknown: true,
    });

    next();
  } catch (err: any) {
    res.status(500).send({
      message: err.message,
    });
  }
};
