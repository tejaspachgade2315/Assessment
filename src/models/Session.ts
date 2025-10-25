import { Document, Schema, model } from "mongoose";

type Option = { id: string; text: string; votes?: number };

interface IQuestion {
  id: string;
  text: string;
  options: Option[];
  multiple?: boolean;
}

export interface ISession extends Document {
  organizer: Schema.Types.ObjectId;
  title: string;
  joinCode: string;
  isActive: boolean;
  createdAt: Date;
  questions: IQuestion[];
  analytics?: {
    totalParticipants: number;
  };
}

const OptionSchema = new Schema(
  { id: String, text: String, votes: { type: Number, default: 0 } },
  { _id: false }
);
const QuestionSchema = new Schema(
  {
    id: String,
    text: String,
    options: [OptionSchema],
    multiple: { type: Boolean, default: false },
  },
  { _id: false }
);

const SessionSchema = new Schema<ISession>({
  organizer: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  title: { type: String, required: true },
  joinCode: { type: String, required: true, unique: true, index: true },
  isActive: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  questions: [QuestionSchema],
  analytics: { totalParticipants: { type: Number, default: 0 } },
});

export default model<ISession>("Session", SessionSchema);
