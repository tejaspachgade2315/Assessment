import Joi from "joi";
import { Request, Response, NextFunction } from "express";

const OptionSchema = Joi.object({
  id: Joi.string().optional(),
  text: Joi.string().min(1).required(),
});

const QuestionSchema = Joi.object({
  id: Joi.string().optional(),
  text: Joi.string().min(1).required(),
  multiple: Joi.boolean().optional(),
  options: Joi.array().items(OptionSchema).min(2).required(),
});

export const createSessionSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  questions: Joi.array().items(QuestionSchema).min(1).required(),
});

export const validateCreateSession = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = createSessionSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) {
    res.status(400).json({ success: false, message: error.details.map(d => d.message) });
    return;
  }
  req.body = value;
  next();
};