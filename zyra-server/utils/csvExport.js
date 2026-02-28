const fs = require("fs");
const path = require("path");
const logger = require("./logger");

const EXPORT_DIR = path.join(__dirname, "../../exports");

// Ensure export directory exists
if (!fs.existsSync(EXPORT_DIR)) {
  fs.mkdirSync(EXPORT_DIR, { recursive: true });
}

/**
 * Append a record to a CSV file explicitly for "new things"
 * 
 * @param {string} filename - The CSV filename (e.g., 'machines.csv')
 * @param {Object} record - The object data to append
 */
const appendToCSV = (filename, record) => {
  try {
    const filePath = path.join(EXPORT_DIR, filename);
    const isNewFile = !fs.existsSync(filePath);

    // Extract keys and values
    const keys = Object.keys(record);
    const values = keys.map(k => {
      let val = record[k];
      if (typeof val === 'object' && val !== null) {
        val = JSON.stringify(val); // stringify nested objects
      }
      // Escaping for CSV
      if (typeof val === 'string') {
        val = `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    });

    let csvLine = "";
    if (isNewFile) {
      csvLine += keys.join(",") + "\n";
    }
    csvLine += values.join(",") + "\n";

    fs.appendFileSync(filePath, csvLine, "utf8");
    logger.info(`Appended new record to CSV: ${filename}`);
  } catch (error) {
    logger.error("Failed to append to CSV", { error: error.message });
  }
};

module.exports = { appendToCSV };
