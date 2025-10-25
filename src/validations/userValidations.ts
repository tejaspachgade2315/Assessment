import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("Organizer").required(),
});

export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error, value } = registerSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) {
    res
      .status(400)
      .json({ success: false, message: error.details.map((d) => d.message) });
    return;
  }
  req.body = value;
  next();
};

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error, value } = loginSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) {
    res
      .status(400)
      .json({ success: false, message: error.details.map((d) => d.message) });
    return;
  }
  req.body = value;
  next();
};
