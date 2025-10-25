import { Request, Response, NextFunction } from "express";

export const fetchHome = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.send("Typescript Backend");
  } catch (error) {
    next(error);
  }
};

export const getHome= (req: Request, res: Response, next: NextFunction) => {
  try {
    res.send("Typescript Backend");
  } catch (error) {
    next(error);
  }
};
