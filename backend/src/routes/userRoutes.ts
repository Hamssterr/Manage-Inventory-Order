import express, { Router } from "express";
import { getSalersList, getAllUsers } from "../controllers/userController.js";
import { protectAuth } from "../middlewares/authMiddleware.js";

const router: Router = express.Router();

router.get("/salers", protectAuth, getSalersList);
router.get("/", protectAuth, getAllUsers);

export default router;
