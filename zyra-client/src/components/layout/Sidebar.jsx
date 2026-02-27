import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Package, Factory, Truck, ShoppingCart,
  Users, DollarSign, Shield, Zap, FlaskConical, Brain,
  ChevronLeft, ChevronRight,
} from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/inventory", icon: Package, label: "Inventory" },
  { to: "/production", icon: Factory, label: "Production" },
  { to: "/supply-chain", icon: Truck, label: "Supply Chain" },
  { to: "/sales", icon: ShoppingCart, label: "Sales" },
  { to: "/hr", icon: Users, label: "HR" },
  { to: "/finance", icon: DollarSign, label: "Finance" },
  { to: "/quality", icon: Shield, label: "Quality" },
  { to: "/optimization", icon: Zap, label: "Optimization" },
  { to: "/simulation", icon: FlaskConical, label: "Simulation" },
  { to: "/ai-insights", icon: Brain, label: "AI Insights" },
];

export default function Sidebar({ open, onToggle }) {
  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-surface-900 text-white z-40 transition-all duration-300 ${
        open ? "w-64" : "w-16"
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-surface-700">
        {open && (
          <span className="text-lg font-bold gradient-text tracking-wider">ZYRA ERP</span>
        )}
        <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-surface-700 transition">
          {open ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-4 flex flex-col gap-1 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary-600 text-white shadow-lg shadow-primary-600/25"
                  : "text-surface-200 hover:bg-surface-800 hover:text-white"
              }`
            }
          >
            <item.icon size={20} className="shrink-0" />
            {open && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
