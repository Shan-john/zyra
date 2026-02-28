import { Routes, Route, Navigate } from "react-router-dom";

// Feature pages (lazy-loadable in production)
import DashboardPage from "../features/dashboard/DashboardPage";
import InventoryPage from "../features/inventory/InventoryPage";
import ProductionPage from "../features/production/ProductionPage";
import SupplyChainPage from "../features/supply-chain/SupplyChainPage";
import SalesPage from "../features/sales/SalesPage";
import HrPage from "../features/hr/HrPage";
import FinancePage from "../features/finance/FinancePage";
import QualityPage from "../features/quality/QualityPage";
import OptimizationPage from "../features/optimization/OptimizationPage";
import SimulationPage from "../features/simulation/SimulationPage";
import AiInsightsPage from "../features/ai-insights/AiInsightsPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/inventory" element={<InventoryPage />} />
      <Route path="/production" element={<ProductionPage />} />
      <Route path="/supply-chain" element={<SupplyChainPage />} />
      <Route path="/sales" element={<SalesPage />} />
      <Route path="/hr" element={<HrPage />} />
      <Route path="/finance" element={<FinancePage />} />
      <Route path="/quality" element={<QualityPage />} />
      <Route path="/optimization" element={<OptimizationPage />} />
      <Route path="/simulation" element={<SimulationPage />} />
      <Route path="/ai-insights" element={<AiInsightsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
