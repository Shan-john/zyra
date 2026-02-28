const { db } = require("../config/firebase");
const { ref, get, set, child } = require("firebase/database");

// ─── Seed Data ────────────────────────────────────────────────────────────────
const SUPPLIER_SEED = [
  { id: "SUP-001", code: "SUP-001", name: "SteelMart Global",       contact: "sales@steelmart.com",   phone: "555-3001", country: "India",  rating: 4.5, isActive: true, category: "Raw Materials" },
  { id: "SUP-002", code: "SUP-002", name: "MetalWorks Europe",      contact: "orders@metalworks.eu",  phone: "555-3002", country: "Germany",rating: 4.2, isActive: true, category: "Raw Materials" },
  { id: "SUP-003", code: "SUP-003", name: "BoltTech Fasteners",     contact: "b2b@bolttech.com",      phone: "555-3003", country: "China",  rating: 3.8, isActive: true, category: "Fasteners" },
  { id: "SUP-004", code: "SUP-004", name: "PrecisionBearings Inc.", contact: "supply@precbear.com",   phone: "555-3004", country: "Japan",  rating: 4.8, isActive: true, category: "Components" },
];

const PO_SEED = [
  { id: "PO-001", poNumber: "PO-001", supplierId: "SUP-001", supplierName: "SteelMart Global",       items: [{ description: "Steel Rod 4mm", quantity: 1000, unitPrice: 3.50 }], totalAmount: 3500,  status: "received",  orderDate: "2026-01-05", expectedDelivery: "2026-01-20", actualDelivery: "2026-01-19" },
  { id: "PO-002", poNumber: "PO-002", supplierId: "SUP-004", supplierName: "PrecisionBearings Inc.", items: [{ description: "Ball Bearing 6201", quantity: 500, unitPrice: 2.20 }], totalAmount: 1100, status: "received",  orderDate: "2026-01-15", expectedDelivery: "2026-01-30", actualDelivery: "2026-01-28" },
  { id: "PO-003", poNumber: "PO-003", supplierId: "SUP-002", supplierName: "MetalWorks Europe",      items: [{ description: "Aluminium Sheet 2mm", quantity: 200, unitPrice: 12.00 }], totalAmount: 2400, status: "transit", orderDate: "2026-02-10", expectedDelivery: "2026-03-01", actualDelivery: null },
  { id: "PO-004", poNumber: "PO-004", supplierId: "SUP-003", supplierName: "BoltTech Fasteners",     items: [{ description: "Hex Bolt M10x30", quantity: 5000, unitPrice: 0.15 }], totalAmount: 750,  status: "pending",   orderDate: "2026-02-20", expectedDelivery: "2026-03-10", actualDelivery: null },
  { id: "PO-005", poNumber: "PO-005", supplierId: "SUP-001", supplierName: "SteelMart Global",       items: [{ description: "Copper Wire 1.5mm", quantity: 300, unitPrice: 8.75 }], totalAmount: 2625, status: "pending",   orderDate: "2026-02-22", expectedDelivery: "2026-03-15", actualDelivery: null },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getList = async (path) => {
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

// ─── Suppliers ────────────────────────────────────────────────────────────────
exports.getSuppliers = async ({ page = 1, limit = 20, search } = {}) => {
  await seedIfEmpty("suppliers", SUPPLIER_SEED, s => s.id);
  let suppliers = (await getList("suppliers")).filter(s => s.isActive);
  if (search) suppliers = suppliers.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  suppliers.sort((a, b) => a.name.localeCompare(b.name));
  const total = suppliers.length;
  const start = (page - 1) * limit;
  return { suppliers: suppliers.slice(start, start + Number(limit)), total, page, totalPages: Math.ceil(total / limit) };
};

exports.addSupplier = async (data) => {
  const existing = (await getList("suppliers")).find(s => s.code === data.code);
  if (existing) throw Object.assign(new Error("Supplier code already exists"), { statusCode: 409 });
  const id = `SUP-${Date.now()}`;
  const supplier = { id, code: id, ...data, isActive: true };
  await set(ref(db, `suppliers/${id}`), supplier);
  return supplier;
};

// ─── Purchase Orders ──────────────────────────────────────────────────────────
exports.getPurchaseOrders = async ({ page = 1, limit = 20, status } = {}) => {
  await seedIfEmpty("purchaseOrders", PO_SEED, p => p.id);
  let orders = await getList("purchaseOrders");
  if (status) orders = orders.filter(o => o.status === status);
  orders.sort((a, b) => b.orderDate.localeCompare(a.orderDate));
  const total = orders.length;
  const start = (page - 1) * limit;
  return { orders: orders.slice(start, start + Number(limit)), total, page, totalPages: Math.ceil(total / limit) };
};

exports.createPurchaseOrder = async (data) => {
  const id = `PO-${Date.now()}`;
  const po = { id, poNumber: id, ...data, status: "pending", orderDate: new Date().toISOString().split("T")[0] };
  await set(ref(db, `purchaseOrders/${id}`), po);
  return po;
};

exports.receiveOrder = async (id) => {
  const snap = await get(ref(db, `purchaseOrders/${id}`));
  if (!snap.exists()) throw Object.assign(new Error("Purchase order not found"), { statusCode: 404 });
  const po = { ...snap.val(), status: "received", actualDelivery: new Date().toISOString().split("T")[0] };
  await set(ref(db, `purchaseOrders/${id}`), po);
  return po;
};
