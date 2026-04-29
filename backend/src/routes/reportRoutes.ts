import express, { Router } from "express";
import {
  getGeneralSalesReport,
  getSalerRevenueReport,
  getDashboardStats,
  getChartData,
} from "../controllers/reportControllers.js";
import { protectAuth, restrictTo } from "../middlewares/authMiddleware.js";

const router: Router = express.Router();

router.get(
  "/general",
  protectAuth,
  restrictTo("admin", "owner", "accountant"),
  getGeneralSalesReport,
);
router.get(
  "/salers",
  protectAuth,
  restrictTo("admin", "owner", "accountant"),
  getSalerRevenueReport,
);
router.get(
  "/dashboard-stats",
  protectAuth,
  restrictTo("admin", "owner", "accountant"),
  getDashboardStats,
);
router.get(
  "/chart",
  protectAuth,
  restrictTo("admin", "owner", "accountant"),
  getChartData,
);

export default router;
