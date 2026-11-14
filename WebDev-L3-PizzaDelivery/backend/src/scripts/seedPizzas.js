import "dotenv/config";
import mongoose from "mongoose";
import Pizza from "../models/Pizza.js";

const pizzas = [
  {
    name: "Margherita",
    description: "Classic pizza with tomato sauce, mozzarella, and fresh basil.",
    category: "vegetarian",
    sizes: [
      { name: "small", price: 120 },
      { name: "medium", price: 170 },
      { name: "large", price: 220 },
    ],
    ingredients: ["Tomato Sauce", "Mozzarella", "Fresh Basil"],
    image: "",
    isAvailable: true,
    isFeatured: true,
  },
  {
    name: "Pepperoni",
    description: "Pizza topped with mozzarella cheese and pepperoni.",
    category: "classic",
    sizes: [
      { name: "small", price: 150 },
      { name: "medium", price: 200 },
      { name: "large", price: 260 },
    ],
    ingredients: ["Tomato Sauce", "Mozzarella", "Pepperoni"],
    image: "",
    isAvailable: true,
    isFeatured: true,
  },
  {
    name: "Veggie Delight",
    description: "A delicious mix of fresh vegetables and mozzarella.",
    category: "vegetarian",
    sizes: [
      { name: "small", price: 130 },
      { name: "medium", price: 180 },
      { name: "large", price: 230 },
    ],
    ingredients: ["Tomato Sauce", "Mozzarella", "Peppers", "Olives", "Onions"],
    image: "",
    isAvailable: true,
    isFeatured: false,
  },
];

async function seedPizzas() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected!");

    for (const pizza of pizzas) {
      await Pizza.findOneAndUpdate(
        { name: pizza.name },
        { $set: pizza },
        {
          upsert: true,
          returnDocument: "after",
          runValidators: true,
        }
      );

      console.log(`${pizza.name} saved successfully`);
    }

    console.log("Pizza seeding completed!");
  } catch (error) {
    console.error("Seeding error:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
  }
}

seedPizzas();