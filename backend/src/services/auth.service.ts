import UserModel from "../models/user.model";
import VerificationCodeModel from "../models/verification.code.model";
import SessionModel from "../models/session.model";
import VerificationCodeType from "../constants/verificationCodeTypes";
import { oneYearFromNow, thirtyDaysFromNow } from "../utils/date";
import { JWT_REFRESH_SECRET, JWT_SECRET } from "../constants/env";
import jwt from "jsonwebtoken";
import appAssert from "../utils/appAssert";
import { CONFLICT, UNAUTHORIZED } from "../constants/http";

export type LoginUserParams = {
  email: string;
  password: string;
  userAgent?: string;
};

export const loginUser = async ({
  email,
  password,
  userAgent,
}: LoginUserParams) => {
  // get user by email
  const user = await UserModel.findOne({ email: email });
  appAssert(user, UNAUTHORIZED, "Invalid email or password");
  // validate password from the request
  const isValid = await user.comparePassword(password);
  appAssert(isValid, UNAUTHORIZED, "Invalid email or password");
  // create a session
  const session = await SessionModel.create({
    userId: user._id,
    userAgent: userAgent,
    expiresAt: thirtyDaysFromNow(),
  });
  const sessionInfo = {
    sessionId: session._id,
  };
  // sign access token & refresh token
  const refreshToken = jwt.sign(sessionInfo, JWT_REFRESH_SECRET, {
    audience: ["user"],
    expiresIn: "30d",
  });
  const accessToken = jwt.sign(
    { ...sessionInfo, userId: user._id },
    JWT_SECRET,
    {
      audience: ["user"],
      expiresIn: "15m",
    }
  );
  // return user and tokens
  return {
    user: user.omitPassword(),
    accessToken: accessToken,
    refreshToken: refreshToken,
  };
};

export type CreateAccountParams = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  userAgent?: string;
};

export const createAccount = async (data: CreateAccountParams) => {
  // verify existing user does not exist
  const existingUser = await UserModel.exists({ email: data.email });
  appAssert(!existingUser, CONFLICT, "Email already in use");
  // create user
  const newUser = await UserModel.create({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    password: data.password,
  });
  // create verification code
  const verificationCode = await VerificationCodeModel.create({
    userId: newUser._id,
    type: VerificationCodeType.EmailVerification,
    expiresAt: oneYearFromNow(),
  });
  // send verification email

  // create session
  const session = await SessionModel.create({
    userId: newUser._id,
    userAgent: data.userAgent,
    expiresAt: thirtyDaysFromNow(),
  });
  // sign access token & refresh token
  const refreshToken = jwt.sign(
    { sessionId: session._id },
    JWT_REFRESH_SECRET,
    { audience: ["user"], expiresIn: "30d" }
  );
  const accessToken = jwt.sign(
    { userId: newUser._id, sessionId: session._id },
    JWT_SECRET,
    {
      audience: ["user"],
      expiresIn: "15m",
    }
  );

  // return user and tokens
  return {
    newUser: newUser.omitPassword(),
    accessToken: accessToken,
    refreshToken: refreshToken,
  };
};
