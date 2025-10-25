import { Document, Schema, model } from "mongoose";
export interface IVote extends Document {
  sessionId: Schema.Types.ObjectId;
  questionId: string;
  optionId: string;
  participantId?: string;
  ip?: string;
  createdAt: Date;
}

const VoteSchema = new Schema({
  sessionId: { type: Schema.Types.ObjectId, ref: "Session", index: true },
  questionId: String,
  optionId: String,
  participantId: String,
  ip: String,
  createdAt: { type: Date, default: Date.now },
});
export default model<IVote>("Vote", VoteSchema);
