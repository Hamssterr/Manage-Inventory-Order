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
  bulkReconcileOrders,
  rollbackOrderToShipping,
  updateOrderStatus,
  cancelOrders,
  cancelDeliveryOrder,
  reconcileSingleOrder,
  getTaxInvoice,
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

// Xác nhận giao thành công hoặc thất bại
router.patch(
  "/reconcile",
  protectAuth,
  restrictTo("admin", "owner", "accountant"),
  bulkReconcileOrders,
);
// Đối soát đơn lẻ (Thành công - hỗ trợ sửa đổi)
router.patch(
  "/:orderId/reconcile",
  protectAuth,
  restrictTo("admin", "owner", "accountant"),
  reconcileSingleOrder,
);

// Hủy đơn hàng duy nhất đang giao
router.patch(
  "/:orderId/cancel-delivery",
  protectAuth,
  restrictTo("admin", "owner", "accountant"),
  cancelDeliveryOrder,
);

// Hoàn tác đơn hàng đã giao về trạng thái đang giao hàng
router.put(
  "/:orderId/rollback",
  protectAuth,
  restrictTo("admin", "accountant", "owner"),
  rollbackOrderToShipping,
);

// Xác nhận đơn hàng
router.patch(
  "/confirm",
  protectAuth,
  restrictTo("admin", "owner", "accountant"),
  updateOrderStatus,
);

// Hủy đơn hàng
router.patch(
  "/cancel",
  protectAuth,
  restrictTo("admin", "owner", "accountant", "salers"),
  cancelOrders,
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

// Hóa đơn thuế
router.get(
  "/:orderId/tax-invoice",
  protectAuth,
  restrictTo("admin", "owner", "accountant"),
  getTaxInvoice,
);

export default router;
