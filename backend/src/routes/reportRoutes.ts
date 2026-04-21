import express, { Router } from "express";
import { getGeneralSalesReport, getSalerRevenueReport } from "../controllers/reportControllers.js";
import { protectAuth, restrictTo } from "../middlewares/authMiddleware.js";

const router: Router = express.Router();

router.get("/general", protectAuth, restrictTo("admin", "owner", "accountant"), getGeneralSalesReport);
router.get("/salers", protectAuth, restrictTo("admin", "owner", "accountant"), getSalerRevenueReport);

export default router;
