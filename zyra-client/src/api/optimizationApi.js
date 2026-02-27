import api from "./axiosInstance";

export const runOptimization = (data) => api.post("/optimization/run", data);
export const getOptimizationResult = (runId) => api.get(`/optimization/results/${runId}`);
export const getOptimizationHistory = (params) => api.get("/optimization/history", { params });
