const SalesOrder = require("../models/SalesOrder");
const Invoice = require("../models/Invoice");

// ─── Sales Orders ──────────────────────────────────────────

exports.getOrders = async ({ page = 1, limit = 20, status }) => {
  const query = {};
  if (status) query.status = status;

  const orders = await SalesOrder.find(query)
    .populate("items.product", "name sku")
    .sort({ orderDate: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const total = await SalesOrder.countDocuments(query);
  return { orders, total, page, totalPages: Math.ceil(total / limit) };
};

exports.createOrder = async (data) => {
  // Calculate subtotal and total
  const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice - (item.discount || 0), 0);
  const tax = subtotal * 0.18; // 18% GST
  const totalAmount = subtotal + tax;

  return SalesOrder.create({ ...data, subtotal, tax, totalAmount });
};

// ─── Invoices ──────────────────────────────────────────────

exports.getInvoices = async ({ page = 1, limit = 20, status }) => {
  const query = {};
  if (status) query.status = status;

  const invoices = await Invoice.find(query)
    .populate("salesOrder", "orderNumber")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const total = await Invoice.countDocuments(query);
  return { invoices, total, page, totalPages: Math.ceil(total / limit) };
};

exports.generateInvoice = async (salesOrderId) => {
  const order = await SalesOrder.findById(salesOrderId).populate("items.product");
  if (!order) throw Object.assign(new Error("Sales order not found"), { statusCode: 404 });

  const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;

  return Invoice.create({
    invoiceNumber,
    salesOrder: order._id,
    customer: order.customer,
    items: order.items.map((item) => ({
      description: item.product?.name || "Product",
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.quantity * item.unitPrice,
    })),
    subtotal: order.subtotal,
    tax: order.tax,
    totalAmount: order.totalAmount,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Net 30
  });
};

// ─── Forecast ──────────────────────────────────────────────

exports.getDemandForecast = async () => {
  // Aggregate last 12 months of sales data
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const salesByMonth = await SalesOrder.aggregate([
    { $match: { orderDate: { $gte: twelveMonthsAgo }, status: { $ne: "cancelled" } } },
    {
      $group: {
        _id: { month: { $month: "$orderDate" }, year: { $year: "$orderDate" } },
        totalRevenue: { $sum: "$totalAmount" },
        orderCount: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  return { historical: salesByMonth, forecastGenerated: new Date() };
};
