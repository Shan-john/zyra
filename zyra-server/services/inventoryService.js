const Inventory = require("../models/Inventory");
const Product = require("../models/Product");

/**
 * Get all inventory items with pagination and filtering.
 */
exports.getAll = async ({ page = 1, limit = 20, warehouse, search }) => {
  const query = { isDeleted: false };
  if (warehouse) query.warehouse = warehouse;
  if (search) query.sku = { $regex: search, $options: "i" };

  const items = await Inventory.find(query)
    .populate("product", "name sku category unitPrice")
    .sort({ updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const total = await Inventory.countDocuments(query);
  return { items, total, page, totalPages: Math.ceil(total / limit) };
};

/**
 * Get a single inventory item by ID.
 */
exports.getById = async (id) => {
  const item = await Inventory.findById(id).populate("product");
  if (!item || item.isDeleted) throw Object.assign(new Error("Inventory item not found"), { statusCode: 404 });
  return item;
};

/**
 * Add a new inventory item.
 */
exports.addItem = async (data) => {
  // Check for duplicate SKU in same warehouse
  const existing = await Inventory.findOne({ sku: data.sku, warehouse: data.warehouse, isDeleted: false });
  if (existing) throw Object.assign(new Error("Item already exists in this warehouse"), { statusCode: 409 });

  return Inventory.create(data);
};

/**
 * Update an inventory item.
 */
exports.updateItem = async (id, data) => {
  const item = await Inventory.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!item) throw Object.assign(new Error("Inventory item not found"), { statusCode: 404 });
  return item;
};

/**
 * Soft-delete an inventory item.
 */
exports.deleteItem = async (id) => {
  const item = await Inventory.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  if (!item) throw Object.assign(new Error("Inventory item not found"), { statusCode: 404 });
  return item;
};

/**
 * Get items below reorder point (alerts).
 */
exports.getAlerts = async () => {
  return Inventory.find({
    isDeleted: false,
    $expr: { $lte: ["$quantity", "$reorderPoint"] },
  })
    .populate("product", "name sku")
    .sort({ quantity: 1 })
    .lean();
};
