import { CREATED, OK, UNAUTHORIZED } from "../constants/http";
import catchAsyncErrors from "../utils/catchAsyncErrors";
import {
  createAccount,
  loginUser,
  refreshUserAccessToken,
} from "../services/auth.service";
import {
  clearAuthCookies,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  setAuthCookies,
} from "../utils/cookies";
import { loginSchema, registerSchema } from "./auth.schemas";
import { verifyToken } from "../utils/jwt";
import SessionModel from "../models/session.model";
import appAssert from "../utils/appAssert";

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
  const accessToken = req.cookies.accessToken as string | undefined;
  const { payload } = verifyToken(accessToken || "");
  if (payload) {
    await SessionModel.findByIdAndDelete(payload.sessionId);
  }
  return clearAuthCookies(res)
    .status(OK)
    .json({ message: "logout successful" });
});

export const refreshHandler = catchAsyncErrors(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken as string | undefined;
  appAssert(refreshToken, UNAUTHORIZED, "Missing refresh token");

  const { accessToken, newRefreshToken } =
    await refreshUserAccessToken(refreshToken);

  if (newRefreshToken) {
    res.cookie("refreshToken", newRefreshToken, getRefreshTokenCookieOptions());
  }

  return res
    .status(OK)
    .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
    .json({ message: "Access token refreshed" });
});
