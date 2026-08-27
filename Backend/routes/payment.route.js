import express from "express";
import {
  getRazorpayKey,
  createPaymentOrder,
  verifyPayment,
} from "../controllers/payment.controller.js";
import verifyToken from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/key", verifyToken, getRazorpayKey);
router.post("/create-order", verifyToken, createPaymentOrder);
router.post("/verify-payment", verifyToken, verifyPayment);

export default router;
