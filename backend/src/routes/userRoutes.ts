import express, { Router } from "express";
import {
  getSalersList,
  getAllUsers,
  createUser,
  resetUserPassword,
} from "../controllers/userController.js";
import { protectAuth, restrictTo } from "../middlewares/authMiddleware.js";

const router: Router = express.Router();

router.get("/salers", protectAuth, getSalersList);
router.post("/", protectAuth, restrictTo("admin", "owner"), createUser);
router.post(
  "/:userId/reset",
  protectAuth,
  restrictTo("admin", "owner"),
  resetUserPassword,
);
router.get("/", protectAuth, getAllUsers);

export default router;
