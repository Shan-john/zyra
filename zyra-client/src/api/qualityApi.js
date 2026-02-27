import api from "./axiosInstance";

export const getInspections = (params) => api.get("/quality/inspections", { params });
export const logInspection = (data) => api.post("/quality/inspections", data);
export const getDefects = (params) => api.get("/quality/defects", { params });
