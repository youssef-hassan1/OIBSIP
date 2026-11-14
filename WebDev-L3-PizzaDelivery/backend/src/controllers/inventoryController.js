import Inventory from "../models/Inventory.js";
import { sendLowStockAlert } from "../utils/emailService.js";

// Get all inventory items (Admin only)
export const getInventory = async (req, res) => {
  try {
    const items = await Inventory.find().sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch inventory",
    });
  }
};

// Add a new inventory item (Admin only)
export const createInventoryItem = async (req, res) => {
  try {
    const { name, category, quantity, unit, lowStockThreshold } = req.body;

    if (!name || !category || !unit || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const item = await Inventory.create({
      name,
      category,
      quantity,
      unit,
      lowStockThreshold,
    });

    return res.status(201).json({
      success: true,
      message: "Inventory item created successfully",
      item,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.code === 11000
        ? "Inventory item already exists"
        : "Failed to create inventory item",
    });
  }
};



export const updateInventoryQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (
      quantity === undefined ||
      typeof quantity !== "number" ||
      !Number.isFinite(quantity) ||
      quantity < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid non-negative quantity",
      });
    }

    const item = await Inventory.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    item.quantity = quantity;

    if (quantity > item.lowStockThreshold) {
      item.lowStockAlertSent = false;
    }

    const shouldSendAlert =
      quantity <= item.lowStockThreshold &&
      !item.lowStockAlertSent;

    // Save inventory before attempting email delivery
    await item.save();

    let emailSent = false;

    if (shouldSendAlert) {
      try {
        await sendLowStockAlert(item);

        item.lowStockAlertSent = true;
        await item.save();

        emailSent = true;
      } catch (emailError) {
        console.error("Low stock email failed:", emailError.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Inventory quantity updated successfully",
      emailSent,
      item,
    });
  } catch (error) {
    console.error("Inventory update error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update inventory quantity",
    });
  }
};

// Get available ingredients for customer customization
export const getAvailableIngredients = async (req, res) => {
  try {
    const ingredients = await Inventory.find({
      quantity: { $gt: 0 },
    }).select("name category -_id");

    return res.status(200).json({
      success: true,
      ingredients,
    });
  } catch (error) {
    console.error("Get available ingredients error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch available ingredients",
    });
  }
};