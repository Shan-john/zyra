const { db } = require("../config/firebase");
const { ref, get, set, child } = require("firebase/database");
const { appendToCSV } = require("../utils/csvExport");

// ─── Seed Data ────────────────────────────────────────────────────────────────
const SALES_ORDERS_SEED = [
  {
    id: "SO-001", orderNumber: "SO-001", customer: { name: "Apex Industries", email: "orders@apex.com", phone: "555-2001" },
    items: [{ description: "Steel Frame Kit", quantity: 50, unitPrice: 120, discount: 500 }],
    subtotal: 5500, tax: 990, totalAmount: 6490,
    status: "delivered", orderDate: "2026-01-10", deliveryDate: "2026-01-20",
  },
  {
    id: "SO-002", orderNumber: "SO-002", customer: { name: "BuildCorp Ltd", email: "procurement@buildcorp.com", phone: "555-2002" },
    items: [{ description: "CNC Machined Parts", quantity: 200, unitPrice: 45, discount: 0 }],
    subtotal: 9000, tax: 1620, totalAmount: 10620,
    status: "processing", orderDate: "2026-02-01", deliveryDate: "2026-02-15",
  },
  {
    id: "SO-003", orderNumber: "SO-003", customer: { name: "MegaMachinery", email: "buy@megamachinery.com", phone: "555-2003" },
    items: [{ description: "Gear Assembly Set", quantity: 30, unitPrice: 250, discount: 1000 }],
    subtotal: 6500, tax: 1170, totalAmount: 7670,
    status: "pending", orderDate: "2026-02-20", deliveryDate: "2026-03-05",
  },
  {
    id: "SO-004", orderNumber: "SO-004", customer: { name: "TechFab Solutions", email: "supply@techfab.com", phone: "555-2004" },
    items: [{ description: "Hydraulic Cylinders", quantity: 10, unitPrice: 980, discount: 500 }],
    subtotal: 9300, tax: 1674, totalAmount: 10974,
    status: "shipped", orderDate: "2026-02-15", deliveryDate: "2026-02-28",
  },
  {
    id: "SO-005", orderNumber: "SO-005", customer: { name: "Precision Parts Co.", email: "orders@precisionparts.com", phone: "555-2005" },
    items: [{ description: "Tool Steel Blocks", quantity: 100, unitPrice: 35, discount: 0 }],
    subtotal: 3500, tax: 630, totalAmount: 4130,
    status: "delivered", orderDate: "2026-01-25", deliveryDate: "2026-02-03",
  },
];

const INVOICES_SEED = [
  { id: "INV-S001", invoiceNumber: "INV-S001", salesOrderId: "SO-001", customer: { name: "Apex Industries" }, subtotal: 5500, tax: 990, totalAmount: 6490, status: "paid",    dueDate: "2026-02-10", createdAt: "2026-01-20" },
  { id: "INV-S002", invoiceNumber: "INV-S002", salesOrderId: "SO-004", customer: { name: "TechFab Solutions" }, subtotal: 9300, tax: 1674, totalAmount: 10974, status: "pending", dueDate: "2026-03-15", createdAt: "2026-02-28" },
  { id: "INV-S003", invoiceNumber: "INV-S003", salesOrderId: "SO-005", customer: { name: "Precision Parts Co." }, subtotal: 3500, tax: 630, totalAmount: 4130, status: "paid", dueDate: "2026-03-03", createdAt: "2026-02-03" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getListFromPath = async (path) => {
  const snap = await get(child(ref(db), path));
  if (!snap.exists()) return [];
  return Object.values(snap.val());
};

const seedIfEmpty = async (path, seed, keyFn) => {
  const snap = await get(child(ref(db), path));
  if (!snap.exists()) {
    for (const item of seed) {
      await set(ref(db, `${path}/${keyFn(item)}`), item);
    }
  }
};

// ─── Sales Orders ─────────────────────────────────────────────────────────────
exports.getOrders = async ({ page = 1, limit = 20, status } = {}) => {
  await seedIfEmpty("salesOrders", SALES_ORDERS_SEED, o => o.id);
  let orders = await getListFromPath("salesOrders");
  if (status) orders = orders.filter(o => o.status === status);
  orders.sort((a, b) => b.orderDate.localeCompare(a.orderDate));
  const total = orders.length;
  const start = (page - 1) * limit;
  return { orders: orders.slice(start, start + Number(limit)), total, page, totalPages: Math.ceil(total / limit) };
};

exports.createOrder = async (data) => {
  const subtotal = (data.items || []).reduce((sum, item) => sum + item.quantity * item.unitPrice - (item.discount || 0), 0);
  const tax = subtotal * 0.18;
  const totalAmount = subtotal + tax;
  const id = `SO-${Date.now()}`;
  const order = { id, orderNumber: id, ...data, subtotal, tax, totalAmount, orderDate: new Date().toISOString().split("T")[0] };
  await set(ref(db, `salesOrders/${id}`), order);
  appendToCSV("sales_orders.csv", order);
  return order;
};

// ─── Invoices ─────────────────────────────────────────────────────────────────
exports.getInvoices = async ({ page = 1, limit = 20, status } = {}) => {
  await seedIfEmpty("invoices", INVOICES_SEED, i => i.id);
  let invoices = await getListFromPath("invoices");
  if (status) invoices = invoices.filter(i => i.status === status);
  invoices.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const total = invoices.length;
  const start = (page - 1) * limit;
  return { invoices: invoices.slice(start, start + Number(limit)), total, page, totalPages: Math.ceil(total / limit) };
};

exports.generateInvoice = async (salesOrderId) => {
  const snap = await get(ref(db, `salesOrders/${salesOrderId}`));
  if (!snap.exists()) throw Object.assign(new Error("Sales order not found"), { statusCode: 404 });
  const order = snap.val();
  const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;
  const id = invoiceNumber;
  const invoice = {
    id, invoiceNumber, salesOrderId,
    customer: order.customer,
    items: (order.items || []).map(item => ({
      description: item.description || "Product",
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.quantity * item.unitPrice,
    })),
    subtotal: order.subtotal, tax: order.tax, totalAmount: order.totalAmount,
    status: "pending",
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    createdAt: new Date().toISOString().split("T")[0],
  };
  await set(ref(db, `invoices/${id}`), invoice);
  appendToCSV("invoices.csv", invoice);
  return invoice;
};

// ─── Demand Forecast ──────────────────────────────────────────────────────────
exports.getDemandForecast = async () => {
  await seedIfEmpty("salesOrders", SALES_ORDERS_SEED, o => o.id);
  const orders = await getListFromPath("salesOrders");
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
  const cutoff = twelveMonthsAgo.toISOString().split("T")[0];

  const map = {};
  orders
    .filter(o => o.status !== "cancelled" && o.orderDate >= cutoff)
    .forEach(o => {
      const d = new Date(o.orderDate);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      if (!map[key]) map[key] = { _id: { year: d.getFullYear(), month: d.getMonth() + 1 }, totalRevenue: 0, orderCount: 0 };
      map[key].totalRevenue += o.totalAmount || 0;
      map[key].orderCount++;
    });

  const historical = Object.values(map).sort((a, b) =>
    a._id.year !== b._id.year ? a._id.year - b._id.year : a._id.month - b._id.month
  );
  return { historical, forecastGenerated: new Date() };
};
