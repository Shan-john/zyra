const { db } = require("../config/firebase");
const { ref, get, set, remove, child } = require("firebase/database");

// ─── Seed Data ────────────────────────────────────────────────────────────────
const INVENTORY_SEED = [
  { id: "INV-001", sku: "STL-4MM",  name: "Steel Rod 4mm",         category: "Raw Materials", warehouse: "WH-A", quantity: 2400, reorderPoint: 500,  unitPrice: 3.50,  unit: "kg",  isDeleted: false },
  { id: "INV-002", sku: "ALU-SHEET",name: "Aluminium Sheet 2mm",   category: "Raw Materials", warehouse: "WH-A", quantity: 320,  reorderPoint: 100,  unitPrice: 12.00, unit: "pcs", isDeleted: false },
  { id: "INV-003", sku: "COP-WIRE", name: "Copper Wire 1.5mm",     category: "Raw Materials", warehouse: "WH-B", quantity: 90,   reorderPoint: 200,  unitPrice: 8.75,  unit: "kg",  isDeleted: false },
  { id: "INV-004", sku: "BRG-6201", name: "Ball Bearing 6201",     category: "Components",    warehouse: "WH-B", quantity: 1500, reorderPoint: 300,  unitPrice: 2.20,  unit: "pcs", isDeleted: false },
  { id: "INV-005", sku: "GEAR-M2",  name: "Spur Gear Module 2",    category: "Components",    warehouse: "WH-A", quantity: 750,  reorderPoint: 200,  unitPrice: 5.80,  unit: "pcs", isDeleted: false },
  { id: "INV-006", sku: "HYDR-OIL", name: "Hydraulic Oil 46",      category: "Consumables",   warehouse: "WH-C", quantity: 55,   reorderPoint: 100,  unitPrice: 18.00, unit: "L",   isDeleted: false },
  { id: "INV-007", sku: "BOLT-M10", name: "Hex Bolt M10x30",       category: "Fasteners",     warehouse: "WH-C", quantity: 8000, reorderPoint: 1000, unitPrice: 0.15,  unit: "pcs", isDeleted: false },
  { id: "INV-008", sku: "SEAL-OR",  name: "O-Ring Seal Pack",      category: "Consumables",   warehouse: "WH-C", quantity: 40,   reorderPoint: 80,   unitPrice: 3.25,  unit: "packs",isDeleted: false },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getAll = async () => {
  const snap = await get(child(ref(db), "inventory"));
  if (!snap.exists()) return [];
  return Object.values(snap.val());
};

const seedIfEmpty = async () => {
  const snap = await get(child(ref(db), "inventory"));
  if (!snap.exists()) {
    for (const item of INVENTORY_SEED) {
      await set(ref(db, `inventory/${item.id}`), item);
    }
  }
};

// ─── Get All ──────────────────────────────────────────────────────────────────
exports.getAll = async ({ page = 1, limit = 20, warehouse, search } = {}) => {
  await seedIfEmpty();
  let items = (await getAll()).filter(i => !i.isDeleted);
  if (warehouse) items = items.filter(i => i.warehouse === warehouse);
  if (search)    items = items.filter(i => i.sku.toLowerCase().includes(search.toLowerCase()) || i.name.toLowerCase().includes(search.toLowerCase()));
  items.sort((a, b) => a.name.localeCompare(b.name));
  const total = items.length;
  const start = (page - 1) * limit;
  return { items: items.slice(start, start + Number(limit)), total, page, totalPages: Math.ceil(total / limit) };
};

// ─── Get By Id ────────────────────────────────────────────────────────────────
exports.getById = async (id) => {
  const snap = await get(ref(db, `inventory/${id}`));
  if (!snap.exists() || snap.val().isDeleted) {
    throw Object.assign(new Error("Inventory item not found"), { statusCode: 404 });
  }
  return snap.val();
};

// ─── Add Item ─────────────────────────────────────────────────────────────────
exports.addItem = async (data) => {
  const existing = (await getAll()).find(i => i.sku === data.sku && i.warehouse === data.warehouse && !i.isDeleted);
  if (existing) throw Object.assign(new Error("Item already exists in this warehouse"), { statusCode: 409 });
  const id = `INV-${Date.now()}`;
  const item = { id, ...data, isDeleted: false };
  await set(ref(db, `inventory/${id}`), item);
  return item;
};

// ─── Update Item ──────────────────────────────────────────────────────────────
exports.updateItem = async (id, data) => {
  const snap = await get(ref(db, `inventory/${id}`));
  if (!snap.exists()) throw Object.assign(new Error("Inventory item not found"), { statusCode: 404 });
  const updated = { ...snap.val(), ...data };
  await set(ref(db, `inventory/${id}`), updated);
  return updated;
};

// ─── Delete Item (soft) ──────────────────────────────────────────────────────
exports.deleteItem = async (id) => {
  const snap = await get(ref(db, `inventory/${id}`));
  if (!snap.exists()) throw Object.assign(new Error("Inventory item not found"), { statusCode: 404 });
  const updated = { ...snap.val(), isDeleted: true };
  await set(ref(db, `inventory/${id}`), updated);
  return updated;
};

// ─── Alerts (below reorder point) ────────────────────────────────────────────
exports.getAlerts = async () => {
  await seedIfEmpty();
  const items = (await getAll()).filter(i => !i.isDeleted && i.quantity <= i.reorderPoint);
  items.sort((a, b) => a.quantity - b.quantity);
  return items;
};
