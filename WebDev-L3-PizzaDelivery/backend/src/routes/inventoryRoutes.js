import express from "express";

import {
  protect,
  adminOnly,
} from "../middleware/authMiddleware.js";

import {
  getInventory,
  createInventoryItem,
  updateInventoryQuantity,
  getAvailableIngredients,
} from "../controllers/inventoryController.js";

const router = express.Router();

// Public endpoint: available customization options
router.get("/available-ingredients", getAvailableIngredients);

// Admin-only endpoints
router.use(protect, adminOnly);

router.get("/", getInventory);
router.post("/", createInventoryItem);
router.patch("/:id", updateInventoryQuantity);

export default router;