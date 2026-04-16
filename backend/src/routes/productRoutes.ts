import express, { Router } from "express";
import {
  getProductDetail,
  getSaleProducts,
  updateSaleProduct,
  createSaleProduct,
  deleteSaleProduct,
} from "../controllers/productControllers.js";
import { protectAuth, restrictTo } from "../middlewares/authMiddleware.js";

const router: Router = express.Router();

router.post(
  "/add",
  protectAuth,
  restrictTo("admin", "owner"),
  createSaleProduct,
);
router.get("/", protectAuth, getSaleProducts);
router.get("/:productId", protectAuth, getProductDetail);
router.put(
  "/:productId",
  protectAuth,
  restrictTo("admin", "owner"),
  updateSaleProduct,
);

router.delete(
  "/:productId",
  protectAuth,
  restrictTo("admin", "owner"),
  deleteSaleProduct,
);

export default router;
