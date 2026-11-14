
import {
  createMockPayment,
  processMockPayment,
} from "./mockPayment.js";

const getPaymentProvider = () => {
  return process.env.PAYMENT_PROVIDER || "mock";
};

// Create a payment through the selected provider
export const createPayment = async (order) => {
  const provider = getPaymentProvider();

  switch (provider) {
    case "mock":
      return createMockPayment(order);

    default:
      throw new Error(`Unsupported payment provider: ${provider}`);
  }
};

// Process a payment result
export const processPayment = async (paymentId, result) => {
  const provider = getPaymentProvider();

  switch (provider) {
    case "mock":
      return processMockPayment(paymentId, result);

    default:
      throw new Error(`Unsupported payment provider: ${provider}`);
  }
};
