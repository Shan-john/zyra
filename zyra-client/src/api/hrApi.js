import api from "./axiosInstance";

export const getEmployees = (params) => api.get("/hr/employees", { params });
export const addEmployee = (data) => api.post("/hr/employees", data);
export const getAttendance = (params) => api.get("/hr/attendance", { params });
export const clockInOut = (data) => api.post("/hr/attendance", data);
export const getPayroll = (params) => api.get("/hr/payroll", { params });
