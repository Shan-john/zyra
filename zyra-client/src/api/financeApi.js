import api from "./axiosInstance";

export const getLedger = (params) => api.get("/finance/ledger", { params });
export const createLedgerEntry = (data) => api.post("/finance/ledger", data);
export const getPnL = (params) => api.get("/finance/pnl", { params });
export const getCashFlow = (params) => api.get("/finance/cashflow", { params });
