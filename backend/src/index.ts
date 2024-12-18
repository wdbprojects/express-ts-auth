import express from "express";
import connectDB from "./config/connectDB";
import cors from "cors";
import { APP_ORIGIN, PORT } from "./constants/env";
import cookieParser from "cookie-parser";
import errorHandler from "./middleware/errorHandler";
import catchAsyncErrors from "./utils/catchAsyncErrors";
import { OK } from "./constants/http";
import authRoutes from "./routes/auth.routes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: APP_ORIGIN, credentials: true }));
app.use(cookieParser());

/* ROUTES */
// example of async route
/*app.get(
  "/",
  catchAsyncErrors(async (req, res, next) => {
    throw new Error("This is test error");
    res.status(200).json({ message: "healthy test" });
  })
);*/

/* ROUTES */
// healthy check
app.get("/", async (req, res, next) => {
  res.status(OK).json({ message: "healthy test" });
});
// auth routes
app.use("/auth", authRoutes);

/* ERROR HANDLER MIDDLEWARE */
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Express server running on port ${PORT}...`);
    });
  } catch (err: any) {
    console.error(`Error with server: ${err.message}`);
  }
};

startServer();
