import { Router } from "express";
import express from "express";
import {
  createOrder,
  getAllOrders,
  getDetailOrder,
  updateOrder,
  deleteOrder,
} from "../controllers/orderControllers.js";
import { protectAuth, restrictTo } from "../middlewares/authMiddleware.js";
import {
  previewExportTicketOrder,
  createExportTicket,
  getExportTickets,
  reconcileOrder,
  rollbackOrderToShipping,
  updateOrderStatus,
} from "../controllers/warehouseControllers.js";

const router: Router = express.Router();

router.get(
  "/export-ticket",
  protectAuth,
  restrictTo("admin", "owner", "accountant"),
  getExportTickets,
);

router.post(
  "/",
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

// export order
router.post(
  "/export-ticket",
  protectAuth,
  restrictTo("admin", "owner", "accountant"),
  createExportTicket,
);

router.post(
  "/preview-export",
  protectAuth,
  restrictTo("admin", "owner", "accountant"),
  previewExportTicketOrder,
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

export default router;
