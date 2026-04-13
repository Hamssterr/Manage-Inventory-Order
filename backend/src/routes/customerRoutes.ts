import { Router } from "express";
import express from "express";
import { protectAuth, restrictTo } from "../middlewares/authMiddleware.js";
import {
  createCustomer,
  getAllCustomer,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customerController.js";

const router: Router = express.Router();

router.post(
  "/",
  protectAuth,
  restrictTo("admin", "owner", "sale"),
  createCustomer,
);
router.get(
  "/",
  protectAuth,
  restrictTo("admin", "owner", "sale"),
  getAllCustomer,
);
router.put(
  "/:customerId",
  protectAuth,
  restrictTo("admin", "owner", "sale"),
  updateCustomer,
);
router.delete(
  "/:customerId",
  protectAuth,
  restrictTo("admin", "owner"),
  deleteCustomer,
);

export default router;
