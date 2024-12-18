import { HttpStatusCode } from "../constants/http";
import AppErrorCode from "../constants/appErrorCode";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errorCode?: AppErrorCode
  ) {
    super(message);
  }
}

new AppError(200, "msg", AppErrorCode.InvalidAccessToken);

export default AppError;
