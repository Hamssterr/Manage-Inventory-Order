import express, { Router } from "express";
import {
  getSalersList,
  createUser,
  resetUserPassword,
  deleteUser,
  exportSalary,
} from "../controllers/employeeController.js";
import { protectAuth, restrictTo } from "../middlewares/authMiddleware.js";

const router: Router = express.Router();

router.get("/", protectAuth, getSalersList);
router.post("/", protectAuth, restrictTo("admin", "owner"), createUser);
router.post(
  "/:employeeId/reset",
  protectAuth,
  restrictTo("admin", "owner"),
  resetUserPassword,
);
router.get(
  "/:employeeId/salary",
  protectAuth,
  restrictTo("admin", "owner"),
  exportSalary,
);
router.delete(
  "/:employeeId",
  protectAuth,
  restrictTo("admin", "owner"),
  deleteUser,
);

export default router;
