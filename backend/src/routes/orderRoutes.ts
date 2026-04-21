import { Router } from "express";
import express from "express";
import { protectAuth, restrictTo } from "../middlewares/authMiddleware.js";
import {
  createOrder,
  createGuestOrder,
  getAllOrders,
  getDetailOrder,
  updateOrder,
  deleteOrder,
  reconcileOrder,
  rollbackOrderToShipping,
  updateOrderStatus,
  bulkReconcileOrders,
} from "../controllers/orderControllers.js";

const router: Router = express.Router();

router.post(
  "/guest",
  protectAuth,
  restrictTo("admin", "owner", "salers"),
  createGuestOrder,
);

router.post(
  "/add",
  protectAuth,
  restrictTo("admin", "owner", "salers"),
  createOrder,
);

router.get(
  "/",
  protectAuth,
  restrictTo("admin", "owner", "salers", "accountant"),
  getAllOrders,
);

router.patch(
  "/bulk-reconcile",
  protectAuth,
  restrictTo("admin", "owner", "accountant"),
  bulkReconcileOrders,
);

router.patch(
  "/:orderId/reconcile",
  protectAuth,
  restrictTo("admin", "owner", "accountant"),
  reconcileOrder,
);

router.put(
  "/:orderId/rollback",
  protectAuth,
  restrictTo("admin", "accountant", "owner"),
  rollbackOrderToShipping,
);

router.patch(
  "/:orderId/status",
  protectAuth,
  restrictTo("admin", "owner", "accountant"),
  updateOrderStatus,
);

router.get(
  "/:orderId",
  protectAuth,
  restrictTo("admin", "owner", "salers", "accountant"),
  getDetailOrder,
);

router.put(
  "/:orderId",
  protectAuth,
  restrictTo("admin", "owner", "salers", "accountant"),
  updateOrder,
);

router.delete(
  "/:orderId",
  protectAuth,
  restrictTo("admin", "owner", "salers", "accountant"),
  deleteOrder,
);

export default router;
