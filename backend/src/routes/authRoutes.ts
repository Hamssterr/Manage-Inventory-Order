import express, { Router } from "express";
import {
  signin,
  signup,
  refreshToken,
  logout,
  getMet,
  updateProfile,
  changePassword,
  uploadAvatar,
} from "../controllers/authControllers.js";
import { protectAuth } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router: Router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/refreshToken", refreshToken);
router.post("/logout", logout);

router.get("/me", protectAuth, getMet);
router.post("/upload", protectAuth, upload.single("avatar"), uploadAvatar);
router.patch("/me/:id", protectAuth, updateProfile);
router.patch("/password", protectAuth, changePassword);

export default router;
