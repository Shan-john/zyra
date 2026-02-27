import api from "./axiosInstance";

export const predictFailure = (data) => api.post("/ai/ml/predict/failure", data);
export const mlHealthCheck = () => api.get("/ai/ml/health");
