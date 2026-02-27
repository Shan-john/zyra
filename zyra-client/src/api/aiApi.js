import api from "./axiosInstance";

export const explainData = (data) => api.post("/ai/explain", data);
export const getCachedExplanation = (id) => api.get(`/ai/explanations/${id}`);
export const summarizeTrends = (data) => api.post("/ai/summarize", data);
