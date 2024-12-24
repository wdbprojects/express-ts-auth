import { CookieOptions, Response } from "express";
import { fifteenMinutesFromNow, thirtyDaysFromNow } from "./date";

const secure = process.env.NODE_ENV !== "development";

const defaults: CookieOptions = {
  sameSite: "strict",
  httpOnly: true,
  secure: secure,
};

export const REFRESH_PATH = "/auth/refresh";

export const getAccessTokenCookieOptions = (): CookieOptions => {
  return { ...defaults, expires: fifteenMinutesFromNow() };
};

export const getRefreshTokenCookieOptions = (): CookieOptions => {
  return { ...defaults, expires: thirtyDaysFromNow(), path: REFRESH_PATH };
};

type CookieParams = {
  res: Response;
  accessToken: string;
  refreshToken: string;
};

export const setAuthCookies = ({
  res,
  accessToken,
  refreshToken,
}: CookieParams) => {
  return res
    .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
    .cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());
};

export const clearAuthCookies = (res: Response) => {
  return res
    .clearCookie("accessToken")
    .clearCookie("refreshToken", { path: REFRESH_PATH });
};
