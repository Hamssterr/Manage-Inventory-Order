import express, { Router } from "express";
import {
  getGeneralSalesReport,
  getSalerRevenueReport,
  getDashboardStats,
  getChartData,
  getSalerRevenueDataReport,
  getTopSellingProducts,
  getSalaryReport,
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
  "/salers-data/:saleId",
  protectAuth,
  restrictTo("admin", "owner", "accountant"),
  getSalerRevenueDataReport,
);

router.get(
  "/dashboard-stats",
  protectAuth,
  restrictTo("admin", "owner", "accountant", "salers"),
  getDashboardStats,
);
router.get(
  "/chart",
  protectAuth,
  restrictTo("admin", "owner", "accountant", "salers"),
  getChartData,
);

// Self report
router.get(
  "/salers-revenue",
  protectAuth,
  restrictTo("salers"),
  getTopSellingProducts,
);

// Salary Report
router.get(
  "/salary",
  protectAuth,
  restrictTo("admin", "owner", "accountant", "salers"),
  getSalaryReport,
);

export default router;
