import express, { Router } from "express";
import {
  signin,
  signup,
  refreshToken,
  logout,
  getMet,
  updateProfile,
} from "../controllers/authControllers.js";
import { protectAuth } from "../middlewares/authMiddleware.js";

const router: Router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/refreshToken", refreshToken);
router.post("/logout", logout);

router.get("/me", protectAuth, getMet);
router.patch("/me/:id", protectAuth, updateProfile);

export default router;
