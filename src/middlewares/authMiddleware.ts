import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers["authorization"];
  if (!token) {
    res.status(401).send({ message: "Unauthorized" });
    return;
  }
  try {
    const actualToken = token.startsWith("Bearer ")
      ? token.split(" ")[1]
      : token;
    const secretKey = process.env.JWT_SECRET as string;

    if (!secretKey) {
      throw new Error("JWT_SECRET is not defined");
    }

    const decoded = jwt.verify(actualToken, secretKey) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).send({ message: "Unauthorized" });
  }
};

export const requireOrganizer = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const { role } = req.user as JwtPayload;
    if (role !== "Organizer") {
      res.status(403).send({ message: "You are not authorized" });
      return;
    }
    next();
  } catch (error) {
    res.status(401).send({ message: "Unauthorized" });
    return;
  }
};
