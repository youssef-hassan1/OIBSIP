
import crypto from "crypto";

// Create a simulated payment
export const createMockPayment = (order) => {
  return {
    paymentId: `mock_${crypto.randomUUID()}`,
    orderId: order._id.toString(),
    amount: order.totalAmount,
    currency: "INR",
    status: "Pending",
  };
};

// Simulate payment result
export const processMockPayment = (paymentId, result) => {
  if (!["success", "failure"].includes(result)) {
    throw new Error("Invalid payment result");
  }

  return {
    paymentId,
    status: result === "success" ? "Paid" : "Failed",
  };
};
