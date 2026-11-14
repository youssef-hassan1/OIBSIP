
import mongoose from "mongoose";
import Order from "../models/Order.js";
import {
  createPayment,
  processPayment,
} from "../services/payments/paymentService.js";
import { deductInventoryForOrder } from "../utils/inventoryService.js";
import { sendLowStockAlert } from "../utils/emailService.js";

const isMockPaymentEnabled = () => {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.PAYMENT_PROVIDER === "mock"
  );
};

// Start a payment for an existing order
export const startPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      user: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.paymentStatus === "Paid") {
      return res.status(400).json({
        success: false,
        message: "Order is already paid",
      });
    }

    const payment = await createPayment(order);

    order.paymentMethod = process.env.PAYMENT_PROVIDER || "mock";
    order.paymentReference = payment.paymentId;

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Payment created successfully",
      payment,
    });
  } catch (error) {
    console.error("Start payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to start payment",
    });
  }
};

// Complete a simulated payment

export const completeMockPayment = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    if (!isMockPaymentEnabled()) {
     return res.status(403).json({
        success: false,
        message: "Mock payments are only available in development mode",
      });
    }
    const { orderId, paymentId, result } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(orderId) ||
      !paymentId ||
      !["success", "failure"].includes(result)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment information",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      user: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (
      order.paymentReference !== paymentId ||
      order.paymentStatus !== "Pending"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or already processed payment",
      });
    }

    // Process the simulated payment
    const paymentResult = await processPayment(paymentId, result);

    // Handle failed payment without deducting inventory
    if (paymentResult.status === "Failed") {
      order.paymentStatus = "Failed";
      await order.save();

      return res.status(200).json({
        success: true,
        message: "Payment failed",
        order,
      });
    }

    let updatedOrder;
    let lowStockItems = [];

    // Deduct inventory and update payment in one transaction
    await session.withTransaction(async () => {
      updatedOrder = await Order.findOne({
        _id: orderId,
        user: req.user.id,
      }).session(session);

      if (
        !updatedOrder ||
        updatedOrder.paymentStatus !== "Pending" ||
        updatedOrder.paymentReference !== paymentId
      ) {
        throw new Error("Order payment is no longer pending");
      }

      lowStockItems = await deductInventoryForOrder(
        updatedOrder,
        session
      );

      updatedOrder.paymentStatus = "Paid";
      await updatedOrder.save({ session });
    });

    // Send low-stock alerts after successful transaction
      for (const item of lowStockItems) {
        try {
        await sendLowStockAlert(item);
    } catch (emailError) {
    console.error(
      `Failed to send low-stock alert for ${item.name}:`,
      emailError
    );
  }
}

    return res.status(200).json({
      success: true,
      message: "Payment paid and inventory deducted successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Complete payment error:", error);

    const statusCode = error.message.startsWith("Insufficient stock")
      ? 409
      : 500;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to process payment",
    });
  } finally {
    await session.endSession();
  }
};
