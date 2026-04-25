import express, { Router } from "express";
import { protectAuth, restrictTo } from "../middlewares/authMiddleware.js";
import {
  previewExportTicketOrder,
  createExportTicket,
  getExportTickets,
  getExportTicketRevenue,
  deleteExportTicket,
  getExportTicketDetail,
} from "../controllers/exportTicketControllers.js";

const router: Router = express.Router();

router.post(
  "/preview",
  protectAuth,
  restrictTo("admin", "owner", "accountant"),
  previewExportTicketOrder,
);
router.post(
  "/add",
  protectAuth,
  restrictTo("admin", "owner", "accountant"),
  createExportTicket,
);
router.get(
  "/",
  protectAuth,
  restrictTo("admin", "owner", "accountant"),
  getExportTickets,
);
router.get(
  "/:ticketId",
  protectAuth,
  restrictTo("admin", "owner", "accountant"),
  getExportTicketDetail,
);
router.get(
  "/:ticketId/revenue",
  protectAuth,
  restrictTo("admin", "owner", "accountant"),
  getExportTicketRevenue,
);
router.delete(
  "/:ticketId",
  protectAuth,
  restrictTo("admin", "owner", "accountant"),
  deleteExportTicket,
);

export default router;
