const cron = require("node-cron");
const Inventory = require("../models/Inventory");
const logger = require("../utils/logger");

/**
 * Nightly reorder alert job.
 * Runs at 2:00 AM every day — checks inventory items below their reorder point.
 */
const reorderAlertJob = cron.schedule(
  "0 2 * * *",
  async () => {
    try {
      const lowStock = await Inventory.find({
        isDeleted: false,
        $expr: { $lte: ["$quantity", "$reorderPoint"] },
      })
        .populate("product", "name sku")
        .lean();

      if (lowStock.length > 0) {
        logger.warn(`Reorder alert: ${lowStock.length} item(s) below reorder point`, {
          items: lowStock.map((i) => ({ sku: i.sku, quantity: i.quantity, reorderPoint: i.reorderPoint })),
        });
        // TODO: Send email/Slack notification
      } else {
        logger.info("Reorder check — all items above threshold");
      }
    } catch (error) {
      logger.error("Reorder alert job failed", { error: error.message });
    }
  },
  { scheduled: false }
);

module.exports = reorderAlertJob;
