import assert from "node:assert";
import AppError from "./AppError";
import { HttpStatusCode } from "../constants/http";
import AppErrorCode from "../constants/appErrorCode";

type AppAssertTypes = (
  condition: any,
  httpStatusCode: HttpStatusCode,
  message: string,
  appErrorCode?: AppErrorCode
) => asserts condition;
/* Asserts a condition and throws an app error if the condition is falsy */
const appAssert: AppAssertTypes = (
  condition,
  httpStatusCode,
  message,
  appErrorCode
) => assert(condition, new AppError(httpStatusCode, message, appErrorCode));

export default appAssert;
