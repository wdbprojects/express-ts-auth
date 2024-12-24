import express from "express";
import {
  registerHandler,
  loginHandler,
  logoutHandler,
  refreshHandler,
} from "../controllers/auth.controller";
const router = express.Router();

router.post("/register", registerHandler);
router.post("/login", loginHandler);
router.get("/logout", logoutHandler);
router.get("/refresh", refreshHandler);

export default router;
