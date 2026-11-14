
import Inventory from "../models/Inventory.js";

// Calculate required inventory based on actual order customizations
const calculateRequiredStock = (order) => {
  const requiredStock = new Map();

  for (const item of order.items) {
    const quantity = item.quantity;

    const ingredients = [
      item.customizations.base,
      item.customizations.sauce,
      item.customizations.cheese,
      ...item.customizations.vegetables,
    ];

    for (const ingredient of ingredients) {
      requiredStock.set(
        ingredient,
        (requiredStock.get(ingredient) || 0) + quantity
      );
    }
  }

  return requiredStock;
};

// Deduct inventory after successful payment
export const deductInventoryForOrder = async (order, session) => {
  if (order.inventoryDeducted) {
    throw new Error("Inventory already deducted for this order");
  }

  const requiredStock = calculateRequiredStock(order);
  const lowStockItems = [];

  for (const [name, quantity] of requiredStock) {
    const item = await Inventory.findOneAndUpdate(
      {
        name,
        quantity: { $gte: quantity },
      },
      {
        $inc: { quantity: -quantity },
      },
      {
        new: true,
        session,
      }
    );

    if (!item) {
      throw new Error(`Insufficient stock for ${name}`);
    }

    if (
      item.quantity <= item.lowStockThreshold &&
      !item.lowStockAlertSent
    ) {
      item.lowStockAlertSent = true;
      await item.save({ session });

      lowStockItems.push({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        lowStockThreshold: item.lowStockThreshold,
      });
    }
  }

  order.inventoryDeducted = true;
  await order.save({ session });

  return lowStockItems;
};
