import UserModel from "../models/user.model";
import VerificationCodeModel from "../models/verification.code.model";
import SessionModel from "../models/session.model";
import VerificationCodeType from "../constants/verificationCodeTypes";
import { one_day_ms, oneYearFromNow, thirtyDaysFromNow } from "../utils/date";
import { JWT_REFRESH_SECRET, JWT_SECRET } from "../constants/env";
import jwt from "jsonwebtoken";
import appAssert from "../utils/appAssert";
import { CONFLICT, UNAUTHORIZED } from "../constants/http";
import {
  RefreshTokenPayload,
  refreshTokenSignOptions,
  signToken,
  verifyToken,
} from "../utils/jwt";

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
  const refreshToken = signToken(sessionInfo, refreshTokenSignOptions);
  const accessToken = signToken({ ...sessionInfo, userId: user._id });
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
  //const UserId =  newUser._id;
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
  const refreshToken = signToken(
    { sessionId: session._id },
    refreshTokenSignOptions
  );
  const accessToken = signToken({
    userId: newUser._id,
    sessionId: session._id,
  });

  // return user and tokens
  return {
    newUser: newUser.omitPassword(),
    accessToken: accessToken,
    refreshToken: refreshToken,
  };
};

export const refreshUserAccessToken = async (refreshToken: string) => {
  const { payload } = verifyToken<RefreshTokenPayload>(refreshToken, {
    secret: refreshTokenSignOptions.secret,
  });
  const now = Date.now();
  appAssert(payload, UNAUTHORIZED, "Invalid refresh token");
  const session = await SessionModel.findById(payload.sessionId);
  appAssert(
    session && session.expiresAt.getTime() > now,
    UNAUTHORIZED,
    "Session expired"
  );
  // refresh session if it expires in the next 24 hours
  const sessionNeedsRefresh = session.expiresAt.getTime() - now <= one_day_ms();
  if (sessionNeedsRefresh) {
    session.expiresAt = thirtyDaysFromNow();
    await session.save();
  }
  // sign tokens
  const newRefreshToken = sessionNeedsRefresh
    ? signToken({ sessionId: session._id }, refreshTokenSignOptions)
    : undefined;

  const accessToken = signToken({
    userId: session.userId,
    sessionId: session._id,
  });
  // return
  return { accessToken: accessToken, newRefreshToken: newRefreshToken };
};
