import mongoose from "mongoose";
import dotenv from "dotenv";
import Inventory from "../models/Inventory.js";

dotenv.config();

const inventoryItems = [
  {
    name: "Pizza Base",
    category: "base",
    quantity: 100,
    unit: "pieces",
  },
  {
    name: "Tomato Sauce",
    category: "sauce",
    quantity: 100,
    unit: "portions",
  },
  {
    name: "Mozzarella",
    category: "cheese",
    quantity: 100,
    unit: "portions",
  },
  {
    name: "Olives",
    category: "vegetable",
    quantity: 100,
    unit: "portions",
  },
  {
    name: "Peppers",
    category: "vegetable",
    quantity: 100,
    unit: "portions",
  },
];

const seedInventory = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    for (const item of inventoryItems) {
      await Inventory.findOneAndUpdate(
        { name: item.name },
        { $setOnInsert: item },
        { upsert: true, returnDocument: "after" }
      );
    }

    console.log("Inventory seeded successfully");
  } catch (error) {
    console.error("Inventory seeding failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

seedInventory();