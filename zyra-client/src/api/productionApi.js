import api from "./axiosInstance";

export const getSchedules = (params) => api.get("/production/schedules", { params });
export const createSchedule = (data) => api.post("/production/schedules", data);
export const getWorkOrders = (params) => api.get("/production/work-orders", { params });
export const createWorkOrder = (data) => api.post("/production/work-orders", data);
export const updateWorkOrderStatus = (id, status) => api.put(`/production/work-orders/${id}/status`, { status });
export const getBom = (productId) => api.get(`/production/bom/${productId}`);
