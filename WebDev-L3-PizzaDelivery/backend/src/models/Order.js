
import mongoose from "mongoose";

// Schema for each pizza inside an order
const orderItemSchema = new mongoose.Schema(
  {
    pizza: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pizza",
      required: true,
    },

    pizzaName: {
      type: String,
      required: true,
    },

    size: {
      type: String,
      enum: ["small", "medium", "large"],
      required: true,
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    customizations: {
      base: {
        type: String,
        required: true,
      },

      sauce: {
        type: String,
        required: true,
      },

      cheese: {
        type: String,
        required: true,
      },

      vegetables: {
        type: [String],
        default: [],
      },
    },
  },
  { _id: false }
);

// Main Order Schema
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "An order must contain at least one item",
      },
    },

    deliveryAddress: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "Order Received",
        "In Kitchen",
        "Sent to Delivery",
      ],
      default: "Order Received",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },

    paymentMethod: {
      type: String,
      enum: ["mock", "razorpay", "stripe", "paypal"],
      default: "mock",
    },

    paymentReference: {
      type: String,
      default: null,
    },

    razorpayOrderId: {
      type: String,
      default: null,
    },

    razorpayPaymentId: {
      type: String,
      default: null,
    },

    razorpaySignature: {
      type: String,
      default: null,
    },
    inventoryDeducted: {
      type: Boolean,
      default: false,
    },
    inventoryDeducted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
