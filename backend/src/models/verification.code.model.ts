import mongoose, { Schema, Document, Types } from "mongoose";
import VerificationCodeType from "../constants/verificationCodeTypes";

export interface VerificationCodeDocument extends Document {
  userId: Types.ObjectId;
  type: VerificationCodeType;
  createdAt: Date;
  expiresAt: Date;
}

const VerificationCodeSchema = new Schema<VerificationCodeDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  type: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

const VerificationCode = mongoose.model(
  "VerificationCode",
  VerificationCodeSchema,
  "verification_codes"
);
export default VerificationCode;
