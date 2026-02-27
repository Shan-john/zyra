import api from "./axiosInstance";

export const getOrders = (params) => api.get("/sales/orders", { params });
export const createOrder = (data) => api.post("/sales/orders", data);
export const getInvoices = (params) => api.get("/sales/invoices", { params });
export const generateInvoice = (salesOrderId) => api.post("/sales/invoices", { salesOrderId });
export const getForecast = () => api.get("/sales/forecast");
