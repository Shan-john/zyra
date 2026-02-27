const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: true,
    });
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.warn(`MongoDB not running locally: ${error.message} - Starting in Demo Mode`);
    // Removed process.exit(1) so the static AI Optimization dashboard can run without a DB
  }
};

module.exports = connectDB;
