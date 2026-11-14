import express from "express";
import { protect,
         adminOnly,
 } from "../middleware/authMiddleware.js";
import { createOrder,
         getMyOrders,
         getAllOrders,
         updateOrderStatus,
 } from "../controllers/orderController.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);
router.get("/", protect, adminOnly, getAllOrders);
router.patch("/:id/status", protect, adminOnly, updateOrderStatus);

export default router;