import { CREATED, OK } from "../constants/http";
import catchAsyncErrors from "../utils/catchAsyncErrors";
import { z } from "zod";
import { createAccount, loginUser } from "../services/auth.service";
import { clearAuthCookies, setAuthCookies } from "../utils/cookies";
import { loginSchema, registerSchema } from "./auth.schemas";
import { verifyToken } from "../utils/jwt";
import SessionModel from "../models/session.model";

export const loginHandler = catchAsyncErrors(async (req, res, next) => {
  // validate request
  const request = loginSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });
  // call service
  const { user, accessToken, refreshToken } = await loginUser(request);
  // return response
  return setAuthCookies({ res, accessToken, refreshToken }).status(OK).json({
    message: "Login successful",
    user: user,
    accessToken: accessToken,
    refreshToken: refreshToken,
  });
});

export const registerHandler = catchAsyncErrors(async (req, res, next) => {
  // validate request
  const request = registerSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });
  // call service
  const { newUser, accessToken, refreshToken } = await createAccount(request);
  // return response
  return setAuthCookies({ res, accessToken, refreshToken })
    .status(CREATED)
    .json({
      user: newUser,
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
});

export const logoutHandler = catchAsyncErrors(async (req, res, next) => {
  console.log(req.cookies);
  const accessToken = req.cookies.accessToken;
  const { payload } = verifyToken(accessToken);
  if (payload) {
    await SessionModel.findByIdAndDelete(payload.sessionId);
  }
  return clearAuthCookies(res)
    .status(OK)
    .json({ message: "logout successful" });
});
