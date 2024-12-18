import mongoose from "mongoose";
const { Schema } = mongoose;
import bcrypt from "bcrypt";
import { compareValue, hashValue } from "../utils/bcrypt";

const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

export interface UserDocument extends mongoose.Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
  comparePassword(val: string): Promise<boolean>;
  omitPassword(): Pick<
    UserDocument,
    | "_id"
    | "firstName"
    | "lastName"
    | "email"
    | "verified"
    | "createdAt"
    | "updatedAt"
    | "__v"
  >;
}

const userSchema = new Schema<UserDocument>(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      match: [regex, "Please fill a valid email address"],
    },
    password: {
      type: String,
      required: true,
      min: [8, "Password at least 8 characters"],
      max: [24, "Password not more than 24 characters"],
    },
    verified: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await hashValue(this.password);
  next();
});

userSchema.methods.comparePassword = async function (val: string) {
  return compareValue(val, this.password);
};

userSchema.methods.omitPassword = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model("User", userSchema);

export default User;
