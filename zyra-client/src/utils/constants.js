export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";
export const APP_NAME = import.meta.env.VITE_APP_NAME || "Zyra ERP";

export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  OPERATOR: "operator",
  VIEWER: "viewer",
};

export const ORDER_STATUSES = [
  "pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned",
];

export const OPTIMIZATION_TYPES = [
  { value: "production-scheduling", label: "Production Scheduling" },
  { value: "inventory-reorder", label: "Inventory Reorder" },
  { value: "resource-allocation", label: "Resource Allocation" },
  { value: "cost-minimization", label: "Cost Minimization" },
];

export const SIMULATION_TYPES = [
  { value: "what-if", label: "What-If" },
  { value: "monte-carlo", label: "Monte Carlo" },
  { value: "sensitivity-analysis", label: "Sensitivity Analysis" },
  { value: "stress-test", label: "Stress Test" },
];
