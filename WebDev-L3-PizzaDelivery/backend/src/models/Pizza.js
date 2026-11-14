import mongoose from "mongoose";

const pizzaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: ["classic", "vegetarian", "special"],
      required: true,
    },

    sizes: [
      {
        name: {
          type: String,
          enum: ["small", "medium", "large"],
          required: true,
        },

        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    ingredients: {
      type: [String],
      default: [],
    },

    image: {
      type: String,
      default: "",
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Pizza = mongoose.model("Pizza", pizzaSchema);

export default Pizza;