import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, role, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res
        .status(400)
        .json({ success: false, message: "Organizer already exists" });
      return;
    }

    const HashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      role,
      passwordHash: HashedPassword,
    });

    await user.save();
    res
      .status(201)
      .json({ success: true, message: "Organizer registered successfully" });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).send("User not found");
      return;
    }
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).send({ message: "Invalid credentials", success: false });
      return;
    }
    const tokenData = {
      userId: user._id,
      email: user.email,
      role: user.role,
    };
    const token = jwt.sign(tokenData, process.env.JWT_SECRET as string, {
      expiresIn: "1d",
    });

    res.setHeader("Authorization", "Bearer " + token);
    res.status(200).send({ message: "Login successful", success: true, token });
  } catch (error) {
    console.log(error)
    res.status(500).send({ message: "Internal server error", success: false });
  }
};
