import { Document, Schema, model } from "mongoose";
export interface IUser extends Document {
  name: string;
  email: string;
  role: "Organizer";
  passwordHash: string;
  createdAt: Date;
}
const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  role: { type: String, enum: ["Organizer"], required: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default model<IUser>("User", UserSchema);
