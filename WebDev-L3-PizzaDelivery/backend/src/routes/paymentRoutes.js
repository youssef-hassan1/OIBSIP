
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  startPayment,
  completeMockPayment,
} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/start", protect, startPayment);
router.post("/mock/complete", protect, completeMockPayment);

export default router;
