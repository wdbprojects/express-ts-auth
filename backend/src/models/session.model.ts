import mongoose, { Document, Types, Schema } from "mongoose";
import { thirtyDaysFromNow } from "../utils/date";

export interface SessionDocument extends Document {
  userId: Types.ObjectId;
  userAgent?: string;
  createdAt: Date;
  expiresAt: Date;
}

const SessionSchema = new Schema<SessionDocument>({
  userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
  userAgent: { type: String },
  createdAt: { type: Date, default: Date.now(), required: true },
  expiresAt: { type: Date, default: thirtyDaysFromNow(), required: true },
});

const Session = mongoose.model<SessionDocument>("Session", SessionSchema);
export default Session;
