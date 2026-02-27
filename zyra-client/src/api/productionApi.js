import api from "./axiosInstance";

// ─── Machines ──────────────────────────────────────────────────────────────
export const getMachines = () => api.get("/production/machines");
export const createMachine = (data) => api.post("/production/machines", data);
export const updateMachine = (id, data) => api.put(`/production/machines/${id}`, data);
export const deleteMachine = (id) => api.delete(`/production/machines/${id}`);

// ─── Work Orders ───────────────────────────────────────────────────────────
export const getWorkOrders = (params) => api.get("/production/work-orders", { params });
export const createWorkOrder = (data) => api.post("/production/work-orders", data);
export const updateWorkOrder = (id, data) => api.put(`/production/work-orders/${id}`, data);
export const deleteWorkOrder = (id) => api.delete(`/production/work-orders/${id}`);

// ─── Schedules & BOM ───────────────────────────────────────────────────────
export const getSchedules = (params) => api.get("/production/schedules", { params });
export const createSchedule = (data) => api.post("/production/schedules", data);
export const getBom = (productId) => api.get(`/production/bom/${productId}`);
