import { Router } from "express";
import express from "express";
import { protectAuth, restrictTo } from "../middlewares/authMiddleware.js";
import {
  createRoute,
  deleteRoute,
  getRouteList,
  updateRoute,
} from "../controllers/routeControllers.js";

const router: Router = express.Router();

router.post("/", protectAuth, restrictTo("admin", "owner"), createRoute);
router.get(
  "/",
  protectAuth,
  restrictTo("admin", "owner", "sale"),
  getRouteList,
);
router.put("/:id", protectAuth, restrictTo("admin", "owner"), updateRoute);
router.delete("/:id", protectAuth, restrictTo("admin", "owner"), deleteRoute);

export default router;
