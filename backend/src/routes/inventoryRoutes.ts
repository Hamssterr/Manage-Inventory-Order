import express, { Router } from "express";
import { protectAuth, restrictTo } from "../middlewares/authMiddleware.js";
import {
  importProductInventory,
  createInventoryProduct,
  getInventoryProducts,
} from "../controllers/inventoryControllers.js";

const router: Router = express.Router();

router.post(
  "/import/:productId",
  protectAuth,
  restrictTo("admin", "owner"),
  importProductInventory,
);
router.post(
  "/add",
  protectAuth,
  restrictTo("admin", "owner"),
  createInventoryProduct,
);
router.get("/", protectAuth, getInventoryProducts);

export default router;
