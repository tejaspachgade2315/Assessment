import crypto from "crypto";
import { Request, Response } from "express";
import Session from "../models/Session";

const genCode = (len = 6) =>
  crypto
    .randomBytes(Math.ceil(len / 2))
    .toString("hex")
    .slice(0, len)
    .toUpperCase();

const genId = () => crypto.randomBytes(8).toString("hex");

export const createSession = async (req: Request, res: Response) => {
  try {
    const { title, questions } = req.body;
    const { userId } = req.user as JwtPayload;
    let joinCode = genCode(6);
    let attempts = 0;
    while ((await Session.findOne({ joinCode })) && attempts < 5) {
      joinCode = genCode(6);
      attempts++;
    }
    const normalizedQuestions = (questions || []).map((q: any) => ({
      id: q.id || genId(),
      text: q.text,
      multiple: !!q.multiple,
      options: (q.options || []).map((o: any) => ({
        id: o.id || genId(),
        text: o.text,
        votes: 0,
      })),
    }));

    const session = new Session({
      organizer: userId,
      title,
      joinCode,
      isActive: false,
      questions: normalizedQuestions,
    });

    await session.save();
    res.status(201).json({ success: true, session });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Could not create session" });
  }
};

export const updateSession = async (req: Request, res: Response) => {
  try {
    const { userId } = req.user as JwtPayload;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const { sessionId } = req.params;
    const session = await Session.findById(sessionId);
    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }

    if (session.organizer.toString() !== String(userId)) {
      return res
        .status(403)
        .json({ success: false, message: "You are not authorized" });
    }
    const updates = req.body;
    const newSession = await Session.findByIdAndUpdate(sessionId, updates, {
      new: true,
    });
    if (!newSession) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }
    res.status(200).json({ success: true, session: newSession });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Could not update session" });
  }
};

export const getAllSessions = async (req: Request, res: Response) => {
  try {
    const sessions = await Session.find({ isActive: true });
    res.status(200).json({ success: true, sessions });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Could not fetch sessions" });
  }
};
