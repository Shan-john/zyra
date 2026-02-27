import api from "./axiosInstance";

export const getSuppliers = (params) => api.get("/supply-chain/suppliers", { params });
export const addSupplier = (data) => api.post("/supply-chain/suppliers", data);
export const getPurchaseOrders = (params) => api.get("/supply-chain/purchase-orders", { params });
export const createPurchaseOrder = (data) => api.post("/supply-chain/purchase-orders", data);
export const receiveOrder = (id) => api.put(`/supply-chain/purchase-orders/${id}/receive`);
