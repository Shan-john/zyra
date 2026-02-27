const QualityInspection = require("../models/QualityInspection");

/**
 * Get all inspections with filtering.
 */
exports.getInspections = async ({ page = 1, limit = 20, result, productId }) => {
  const query = {};
  if (result) query.result = result;
  if (productId) query.product = productId;

  const inspections = await QualityInspection.find(query)
    .populate("product", "name sku")
    .populate("workOrder", "orderNumber")
    .populate("inspector", "firstName lastName")
    .sort({ inspectionDate: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const total = await QualityInspection.countDocuments(query);
  return { inspections, total, page, totalPages: Math.ceil(total / limit) };
};

/**
 * Log a new inspection.
 */
exports.logInspection = async (data) => {
  return QualityInspection.create(data);
};

/**
 * Defect analytics — aggregated defect types across all inspections.
 */
exports.getDefectAnalytics = async ({ startDate, endDate }) => {
  const dateFilter = {};
  if (startDate && endDate) {
    dateFilter.inspectionDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  const defectsByType = await QualityInspection.aggregate([
    { $match: dateFilter },
    { $unwind: "$defectTypes" },
    {
      $group: {
        _id: { type: "$defectTypes.type", severity: "$defectTypes.severity" },
        count: { $sum: "$defectTypes.count" },
        inspections: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  const overallStats = await QualityInspection.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: null,
        totalInspections: { $sum: 1 },
        totalSampled: { $sum: "$sampleSize" },
        totalFailed: { $sum: "$failedCount" },
        totalPassed: { $sum: "$passedCount" },
      },
    },
  ]);

  return {
    defectsByType,
    overall: overallStats[0] || {},
    overallDefectRate: overallStats[0]
      ? ((overallStats[0].totalFailed / overallStats[0].totalSampled) * 100).toFixed(2)
      : 0,
  };
};
