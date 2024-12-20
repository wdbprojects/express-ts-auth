import express from "express";
import {
  registerHandler,
  loginHandler,
  logoutHandler,
} from "../controllers/auth.controller";
const router = express.Router();

router.post("/register", registerHandler);
router.post("/login", loginHandler);
router.get("/logout", logoutHandler);

export default router;
