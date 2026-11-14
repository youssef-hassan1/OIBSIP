
import cron from "node-cron";
import Inventory from "../models/Inventory.js";
import { sendLowStockAlert } from "../utils/emailService.js";

export const startInventoryAlertJob = () => {
  // Check inventory every 5 minutes
  cron.schedule("*/5 * * * *", async () => {
    console.log("Running scheduled inventory check...");

    try {
      const items = await Inventory.find({
        lowStockAlertSent: false,
      });

      for (const item of items) {
        if (item.quantity <= item.lowStockThreshold) {
          try {
            await sendLowStockAlert(item);

            item.lowStockAlertSent = true;
            await item.save();

            console.log(`Low stock alert sent for: ${item.name}`);
          } catch (emailError) {
            console.error(
              `Failed to send low stock alert for ${item.name}:`,
              emailError.message
            );
          }
        }
      }
    } catch (error) {
      console.error("Scheduled inventory check failed:", error);
    }
  });

  console.log("Inventory alert scheduler started.");
};
