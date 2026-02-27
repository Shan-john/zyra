const Supplier = require("../models/Supplier");
const PurchaseOrder = require("../models/PurchaseOrder");

// ─── Suppliers ─────────────────────────────────────────────

exports.getSuppliers = async ({ page = 1, limit = 20, search }) => {
  const query = { isActive: true };
  if (search) query.name = { $regex: search, $options: "i" };

  const suppliers = await Supplier.find(query)
    .sort({ name: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const total = await Supplier.countDocuments(query);
  return { suppliers, total, page, totalPages: Math.ceil(total / limit) };
};

exports.addSupplier = async (data) => {
  const existing = await Supplier.findOne({ code: data.code });
  if (existing) throw Object.assign(new Error("Supplier code already exists"), { statusCode: 409 });
  return Supplier.create(data);
};

// ─── Purchase Orders ───────────────────────────────────────

exports.getPurchaseOrders = async ({ page = 1, limit = 20, status }) => {
  const query = {};
  if (status) query.status = status;

  const orders = await PurchaseOrder.find(query)
    .populate("supplier", "name code")
    .populate("items.product", "name sku")
    .sort({ orderDate: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const total = await PurchaseOrder.countDocuments(query);
  return { orders, total, page, totalPages: Math.ceil(total / limit) };
};

exports.createPurchaseOrder = async (data) => {
  return PurchaseOrder.create(data);
};

exports.receiveOrder = async (id) => {
  const po = await PurchaseOrder.findById(id);
  if (!po) throw Object.assign(new Error("Purchase order not found"), { statusCode: 404 });

  po.status = "received";
  po.actualDelivery = new Date();
  await po.save();
  return po;
};
