import express, { Router } from "express";
import { protectAuth, restrictTo } from "../middlewares/authMiddleware.js";
import {
  importProductInventory,
  createInventoryProduct,
  getInventoryProducts,
  getInventoryProductById,
  updateInventoryProduct,
  deleteInventoryProduct,
} from "../controllers/inventoryControllers.js";

const router: Router = express.Router();

router.post(
  "/:productId/import",
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
router.put(
  "/:productId",
  protectAuth,
  restrictTo("admin", "owner"),
  updateInventoryProduct,
);
router.get("/", protectAuth, getInventoryProducts);
router.get("/:productId", protectAuth, getInventoryProductById);
router.delete(
  "/:productId",
  protectAuth,
  restrictTo("admin", "owner"),
  deleteInventoryProduct,
);

export default router;
