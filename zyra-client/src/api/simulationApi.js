import api from "./axiosInstance";

export const runSimulation = (data) => api.post("/simulation/run", data);
export const getSimulationResult = (scenarioId) => api.get(`/simulation/results/${scenarioId}`);
export const listScenarios = (params) => api.get("/simulation/scenarios", { params });
