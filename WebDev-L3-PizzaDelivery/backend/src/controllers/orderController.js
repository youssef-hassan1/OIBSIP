
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Pizza from "../models/Pizza.js";
import { sendOrderStatusEmail } from "../utils/emailService.js";
import Inventory from "../models/Inventory.js";

export const createOrder = async (req, res) => {
  try {
    const {
      items,
      deliveryAddress,
      phone,
    } = req.body;

    // 1. Validate required fields
    if (
      !Array.isArray(items) ||
      items.length === 0 ||
      !deliveryAddress ||
      !phone
    ) {
      return res.status(400).json({
        success: false,
        message: "Items, delivery address, and phone are required",
      });
    }

    let subtotal = 0;
    const orderItems = [];

    const requiredStock = new Map();
const expectedCategories = new Map();

const addRequiredIngredient = (name, category, quantity) => {
  requiredStock.set(
    name,
    (requiredStock.get(name) || 0) + quantity
  );

  expectedCategories.set(name, category);
};

    // 2. Validate and prepare each order item
    for (const item of items) {
      const {
        pizzaId,
        size,
        quantity,
        customizations,
      } = item;

      if (
        !mongoose.Types.ObjectId.isValid(pizzaId) ||
        !["small", "medium", "large"].includes(size) ||
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid pizza, size, or quantity",
        });
      }

      if (
        !customizations ||
        typeof customizations.base !== "string" ||
        !customizations.base.trim() ||
        typeof customizations.sauce !== "string" ||
        !customizations.sauce.trim() ||
        typeof customizations.cheese !== "string" ||
        !customizations.cheese.trim() ||
        !Array.isArray(customizations.vegetables) ||
        !customizations.vegetables.every(
        (vegetable) =>
        typeof vegetable === "string" && vegetable.trim()
       )
    ) {
        return res.status(400).json({
         success: false,
          message: "Valid pizza customizations are required",
      });
 }

const normalizedCustomizations = {
  base: customizations.base.trim(),
  sauce: customizations.sauce.trim(),
  cheese: customizations.cheese.trim(),
  vegetables: customizations.vegetables.map(
    (vegetable) => vegetable.trim()
  ),
};

if (
  new Set(normalizedCustomizations.vegetables).size !==
  normalizedCustomizations.vegetables.length
) {
  return res.status(400).json({
    success: false,
    message: "Duplicate vegetables are not allowed",
  });
}

addRequiredIngredient(
  normalizedCustomizations.base,
  "base",
  quantity
);

addRequiredIngredient(
  normalizedCustomizations.sauce,
  "sauce",
  quantity
);

addRequiredIngredient(
  normalizedCustomizations.cheese,
  "cheese",
  quantity
);

for (const vegetable of normalizedCustomizations.vegetables) {
  addRequiredIngredient(vegetable, "vegetable", quantity);
}

      // 3. Get pizza from database
      const pizza = await Pizza.findOne({
        _id: pizzaId,
        isAvailable: true,
      });

      if (!pizza) {
        return res.status(404).json({
          success: false,
          message: "Pizza not found or unavailable",
        });
      }

      // 4. Get the actual price from database
      const selectedSize = pizza.sizes.find(
        (pizzaSize) => pizzaSize.name === size
      );

      if (!selectedSize) {
        return res.status(400).json({
          success: false,
          message: `Selected size is unavailable for ${pizza.name}`,
        });
      }

      const unitPrice = selectedSize.price;

      subtotal += unitPrice * quantity;

      // 5. Prepare order item
      orderItems.push({
        pizza: pizza._id,
        pizzaName: pizza.name,
        size,
        unitPrice,
        quantity,
        customizations: normalizedCustomizations,
      });
    }
    const inventoryItems = await Inventory.find({
  name: { $in: [...requiredStock.keys()] },
});

const inventoryMap = new Map(
  inventoryItems.map((item) => [item.name, item])
);

for (const [name, requiredQuantity] of requiredStock) {
  const inventoryItem = inventoryMap.get(name);

  if (
    !inventoryItem ||
    inventoryItem.category !== expectedCategories.get(name)
  ) {
    return res.status(400).json({
      success: false,
      message: `Invalid ingredient selection: ${name}`,
    });
  }

  if (inventoryItem.quantity < requiredQuantity) {
    return res.status(409).json({
      success: false,
      message: `Insufficient stock for ${name}`,
    });
  }
}

    // 6. Calculate delivery fee and total
    const deliveryFee = 0;
    const totalAmount = subtotal + deliveryFee;

    // 7. Create order
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      deliveryAddress,
      phone,
      subtotal,
      deliveryFee,
      totalAmount,
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });

  } catch (error) {
    console.error("Create order error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create order",
    });
  }
};

// Get all orders belonging to the logged-in customer
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch your orders",
    });
  }
};

// Get all orders (Admin only)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

// Update order status (Admin only)

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const allowedStatuses = [
      "Order Received",
      "In Kitchen",
      "Sent to Delivery",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(id)
      .populate("user", "name email");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const currentIndex = allowedStatuses.indexOf(order.status);
    const nextIndex = allowedStatuses.indexOf(status);

    if (nextIndex !== currentIndex + 1) {
      return res.status(400).json({
        success: false,
        message: "Order status must follow the required sequence",
      });
    }

    if (!order.user) {
      return res.status(404).json({
        success: false,
        message: "Order customer not found",
      });
    }

    order.status = status;
    await order.save();

    try {
      await sendOrderStatusEmail(order.user.email, order);
    } catch (emailError) {
      console.error("Order status email error:", emailError);
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });

  } catch (error) {
    console.error("Update order status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
};