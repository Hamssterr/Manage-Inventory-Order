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
  "/add",
  protectAuth,
  restrictTo("admin", "owner", "salers", "accountant"),
  createCustomer,
);
router.get(
  "/",
  protectAuth,
  restrictTo("admin", "owner", "salers", "accountant"),
  getAllCustomer,
);
router.put(
  "/:customerId",
  protectAuth,
  restrictTo("admin", "owner", "salers", "accountant"),
  updateCustomer,
);
router.delete(
  "/:customerId",
  protectAuth,
  restrictTo("admin", "owner", "salers", "accountant"),
  deleteCustomer,
);

export default router;
