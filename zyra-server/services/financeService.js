const { db } = require("../config/firebase");
const { ref, get, set, push, child } = require("firebase/database");

// ─── Seed Data ────────────────────────────────────────────────────────────────
const LEDGER_SEED = [
  { id: "LED-001", type: "income",  category: "Product Sales",    description: "Q4 product sales",           amount: 125000, date: "2026-01-15", reference: "REV-001" },
  { id: "LED-002", type: "income",  category: "Service Revenue",  description: "Consulting services",        amount: 45000,  date: "2026-01-20", reference: "REV-002" },
  { id: "LED-003", type: "expense", category: "Raw Materials",    description: "Steel and aluminium stock",  amount: 38000,  date: "2026-01-18", reference: "EXP-001" },
  { id: "LED-004", type: "expense", category: "Salaries",         description: "January payroll",            amount: 72000,  date: "2026-01-31", reference: "EXP-002" },
  { id: "LED-005", type: "income",  category: "Product Sales",    description: "Bulk order – Client A",      amount: 98000,  date: "2026-02-05", reference: "REV-003" },
  { id: "LED-006", type: "expense", category: "Utilities",        description: "Factory power & water",      amount: 12000,  date: "2026-02-10", reference: "EXP-003" },
  { id: "LED-007", type: "expense", category: "Maintenance",      description: "CNC machine servicing",      amount: 8500,   date: "2026-02-12", reference: "EXP-004" },
  { id: "LED-008", type: "income",  category: "Product Sales",    description: "Export shipment – March",    amount: 160000, date: "2026-02-20", reference: "REV-004" },
  { id: "LED-009", type: "expense", category: "Logistics",        description: "Freight and customs",        amount: 15000,  date: "2026-02-22", reference: "EXP-005" },
  { id: "LED-010", type: "expense", category: "Raw Materials",    description: "Copper wiring batch",        amount: 22000,  date: "2026-02-25", reference: "EXP-006" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getAll = async () => {
  const snap = await get(child(ref(db), "ledger"));
  if (!snap.exists()) return [];
  return Object.values(snap.val());
};

const seedIfEmpty = async () => {
  const snap = await get(child(ref(db), "ledger"));
  if (!snap.exists()) {
    for (const entry of LEDGER_SEED) {
      await set(ref(db, `ledger/${entry.id}`), entry);
    }
  }
};

// ─── Get Ledger ───────────────────────────────────────────────────────────────
exports.getLedger = async ({ page = 1, limit = 50, type, category, startDate, endDate } = {}) => {
  await seedIfEmpty();
  let entries = await getAll();
  if (type)     entries = entries.filter(e => e.type === type);
  if (category) entries = entries.filter(e => e.category === category);
  if (startDate && endDate) entries = entries.filter(e => e.date >= startDate && e.date <= endDate);
  entries.sort((a, b) => b.date.localeCompare(a.date));
  const total = entries.length;
  const start = (page - 1) * limit;
  return { entries: entries.slice(start, start + Number(limit)), total, page, totalPages: Math.ceil(total / limit) };
};

// ─── Create Entry ─────────────────────────────────────────────────────────────
exports.createEntry = async (data) => {
  const id = `LED-${Date.now()}`;
  const entry = { id, ...data, date: data.date || new Date().toISOString().split("T")[0] };
  await set(ref(db, `ledger/${id}`), entry);
  return entry;
};

// ─── P&L ──────────────────────────────────────────────────────────────────────
exports.getPnL = async ({ startDate, endDate } = {}) => {
  await seedIfEmpty();
  let entries = await getAll();
  if (startDate && endDate) entries = entries.filter(e => e.date >= startDate && e.date <= endDate);

  const incomeMap = {}, expenseMap = {};
  entries.forEach(e => {
    if (e.type === "income") {
      incomeMap[e.category] = (incomeMap[e.category] || 0) + e.amount;
    } else {
      expenseMap[e.category] = (expenseMap[e.category] || 0) + e.amount;
    }
  });

  const income   = Object.entries(incomeMap).map(([_id, total]) => ({ _id, total })).sort((a,b) => b.total - a.total);
  const expenses = Object.entries(expenseMap).map(([_id, total]) => ({ _id, total })).sort((a,b) => b.total - a.total);
  const totalIncome   = income.reduce((s, i) => s + i.total, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.total, 0);
  return { income, expenses, totalIncome, totalExpenses, netProfit: totalIncome - totalExpenses };
};

// ─── Cash Flow ────────────────────────────────────────────────────────────────
exports.getCashFlow = async ({ months = 6 } = {}) => {
  await seedIfEmpty();
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  const cutoffStr = cutoff.toISOString().split("T")[0];

  const entries = (await getAll()).filter(e => e.date >= cutoffStr);
  const map = {};
  entries.forEach(e => {
    const d = new Date(e.date);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}-${e.type}`;
    if (!map[key]) map[key] = { _id: { year: d.getFullYear(), month: d.getMonth() + 1, type: e.type }, total: 0 };
    map[key].total += e.amount;
  });
  return Object.values(map).sort((a, b) =>
    a._id.year !== b._id.year ? a._id.year - b._id.year : a._id.month - b._id.month
  );
};
