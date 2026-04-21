import express, { Router } from "express";
import { getSalersList, getAllUsers, createUser } from "../controllers/userController.js";
import { protectAuth, restrictTo } from "../middlewares/authMiddleware.js";

const router: Router = express.Router();

router.get("/salers", protectAuth, getSalersList);
router.post("/", protectAuth, restrictTo("admin", "owner"), createUser);
router.get("/", protectAuth, getAllUsers);

export default router;
