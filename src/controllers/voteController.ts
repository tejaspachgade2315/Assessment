import crypto from "crypto";
import { Request, Response } from "express";
import Session from "../models/Session";
import Vote from "../models/Vote";

type QueueEntry = {
  sessionId: string;
  questionId: string;
  optionId: string;
  participantId?: string;
  ip?: string;
  firstVoteForSession?: boolean;
  createdAt?: Date;
};

const voteQueue: QueueEntry[] = [];
let processing = false;
const QUEUE_PROCESS_INTERVAL_MS = 500; // batch every 500ms

function enqueueVotes(entries: QueueEntry[]) {
  voteQueue.push(...entries);
  if (!processing) {
    processing = true;
    setTimeout(processQueue, QUEUE_PROCESS_INTERVAL_MS);
  }
}

async function processQueue() {
  const batch = voteQueue.splice(0, voteQueue.length);
  processing = false;
  if (batch.length === 0) return;
  const keyMap = new Map<
    string,
    { sessionId: string; questionId: string; optionId: string; count: number }
  >();
  const sessionParticipantFirstVote = new Map<string, Set<string>>();

  for (const e of batch) {
    const key = `${e.sessionId}::${e.questionId}::${e.optionId}`;
    const existing = keyMap.get(key);
    if (existing) existing.count++;
    else
      keyMap.set(key, {
        sessionId: e.sessionId,
        questionId: e.questionId,
        optionId: e.optionId,
        count: 1,
      });

    if (e.firstVoteForSession && e.participantId) {
      const s =
        sessionParticipantFirstVote.get(e.sessionId) ?? new Set<string>();
      s.add(e.participantId);
      sessionParticipantFirstVote.set(e.sessionId, s);
    }
  }

  try {
    for (const [, info] of keyMap) {
      try {
        await Session.updateOne(
          { _id: info.sessionId, "questions.id": info.questionId },
          {
            $inc: { "questions.$[q].options.$[o].votes": info.count },
          },
          {
            arrayFilters: [
              { "q.id": info.questionId },
              { "o.id": info.optionId },
            ],
          }
        ).exec();
      } catch (err) {
        console.error("Failed to increment option votes", err);
      }
    }

    for (const [
      sessionId,
      participants,
    ] of sessionParticipantFirstVote.entries()) {
      try {
        await Session.updateOne(
          { _id: sessionId },
          { $inc: { "analytics.totalParticipants": participants.size } }
        ).exec();
      } catch (err) {
        console.error("Failed to increment analytics for session", err);
      }
    }
  } catch (err) {
    console.error("Error processing vote queue", err);
  }
}

export const joinSession = async (req: Request, res: Response) => {
  try {
    const { joinCode } = req.params;
    const session = await Session.findOne({ joinCode }).lean();
    if (!session) {
      res.status(404).json({ success: false, message: "Session not found" });
      return;
    }
    if (!session.isActive) {
      res
        .status(403)
        .json({ success: false, message: "Session is not active" });
      return;
    }

    const publicQuestions = (session.questions || []).map((q: any) => ({
      id: q.id,
      text: q.text,
      multiple: q.multiple,
      options: (q.options || []).map((o: any) => ({ id: o.id, text: o.text })),
    }));

    const participantIdFromHeader = (req.header("x-participant-id") ||
      "") as string;
    const participantId =
      participantIdFromHeader ||
      (req.cookies && req.cookies.participantId) ||
      crypto.randomUUID();

    try {
      res.cookie("participantId", participantId, {
        httpOnly: false,
        maxAge: 1000 * 60 * 60 * 24 * 365,
      }); // 1y
    } catch (err) {}

    res.setHeader("x-participant-id", participantId);
    res.status(200).json({
      success: true,
      session: {
        id: session._id,
        title: session.title,
        joinCode: session.joinCode,
        questions: publicQuestions,
      },
      participantId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Could not join session" });
  }
};

export const submitVotes = async (req: Request, res: Response) => {
  try {
    const { joinCode, participantId: providedPid, answers } = req.body;
    if (!joinCode || !Array.isArray(answers) || answers.length === 0) {
      res
        .status(400)
        .json({ success: false, message: "joinCode and answers are required" });
      return;
    }

    const session = await Session.findOne({ joinCode }).exec();
    if (!session) {
      res.status(404).json({ success: false, message: "Session not found" });
      return;
    }
    if (!session.isActive) {
      res
        .status(403)
        .json({ success: false, message: "Session is not active" });
      return;
    }

    const participantId =
      providedPid ||
      (req.cookies && req.cookies.participantId) ||
      req.header("x-participant-id") ||
      crypto.randomUUID();

    const ip =
      (req.ip as string) ||
      (req.connection && (req.connection as any).remoteAddress) ||
      "";

    const hadAnyVotesForSession = await Vote.exists({
      sessionId: session._id,
      participantId,
    });

    const toInsert: any[] = [];
    const queueEntries: QueueEntry[] = [];
    const skipped: { questionId: string; reason: string }[] = [];

    for (const a of answers) {
      const questionId = a.questionId;
      const optionIds: string[] = Array.isArray(a.optionIds)
        ? a.optionIds
        : [a.optionId].filter(Boolean);

      if (!questionId || optionIds.length === 0) {
        skipped.push({
          questionId: questionId || "unknown",
          reason: "Missing questionId or optionIds",
        });
        continue;
      }

      const question = (session.questions || []).find(
        (q: any) => q.id === questionId
      );
      if (!question) {
        skipped.push({ questionId, reason: "Question not found in session" });
        continue;
      }

      const existing = await Vote.exists({
        sessionId: session._id,
        questionId,
        participantId,
      });
      if (existing) {
        skipped.push({
          questionId,
          reason: "Participant already voted this question",
        });
        continue;
      }

      if (!question.multiple && optionIds.length > 1) {
        skipped.push({
          questionId,
          reason: "Multiple choices not allowed for this question",
        });
        continue;
      }
      const validOptionIds = (question.options || []).map((o: any) => o.id);
      const invalid = optionIds.filter((oid) => !validOptionIds.includes(oid));
      if (invalid.length > 0) {
        skipped.push({
          questionId,
          reason: "Invalid option id(s): " + invalid.join(","),
        });
        continue;
      }

      for (const optId of optionIds) {
        toInsert.push({
          sessionId: session._id,
          questionId,
          optionId: optId,
          participantId,
          ip,
          createdAt: new Date(),
        });

        queueEntries.push({
          sessionId: String(session._id),
          questionId,
          optionId: optId,
          participantId,
          ip,
          firstVoteForSession: !hadAnyVotesForSession,
          createdAt: new Date(),
        });
      }
    }

    if (toInsert.length > 0) {
      try {
        await Vote.insertMany(toInsert, { ordered: false });
      } catch (err) {
        console.warn("Partial insertMany error (ignored):", err);
      }
      enqueueVotes(queueEntries);
    }

    res.setHeader("x-participant-id", participantId);
    try {
      res.cookie("participantId", participantId, {
        httpOnly: false,
        maxAge: 1000 * 60 * 60 * 24 * 365,
      });
    } catch (e) {}

    res.status(202).json({
      success: true,
      message: "Votes accepted for processing",
      accepted: toInsert.length,
      skipped,
      participantId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Could not submit votes" });
  }
};
