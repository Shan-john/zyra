const LedgerEntry = require("../models/LedgerEntry");

/**
 * Get ledger entries with optional filters.
 */
exports.getLedger = async ({ page = 1, limit = 50, type, category, startDate, endDate }) => {
  const query = {};
  if (type) query.type = type;
  if (category) query.category = category;
  if (startDate && endDate) {
    query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  const entries = await LedgerEntry.find(query)
    .sort({ date: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const total = await LedgerEntry.countDocuments(query);
  return { entries, total, page, totalPages: Math.ceil(total / limit) };
};

/**
 * Create a ledger entry.
 */
exports.createEntry = async (data) => {
  return LedgerEntry.create(data);
};

/**
 * Profit & Loss report for a date range.
 */
exports.getPnL = async ({ startDate, endDate }) => {
  const dateFilter = {};
  if (startDate && endDate) {
    dateFilter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  const [income, expenses] = await Promise.all([
    LedgerEntry.aggregate([
      { $match: { type: "income", ...dateFilter } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
    ]),
    LedgerEntry.aggregate([
      { $match: { type: "expense", ...dateFilter } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
    ]),
  ]);

  const totalIncome = income.reduce((sum, i) => sum + i.total, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.total, 0);

  return {
    income,
    expenses,
    totalIncome,
    totalExpenses,
    netProfit: totalIncome - totalExpenses,
  };
};

/**
 * Cash flow summary.
 */
exports.getCashFlow = async ({ months = 6 }) => {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const cashFlow = await LedgerEntry.aggregate([
    { $match: { date: { $gte: startDate } } },
    {
      $group: {
        _id: {
          month: { $month: "$date" },
          year: { $year: "$date" },
          type: "$type",
        },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  return cashFlow;
};
