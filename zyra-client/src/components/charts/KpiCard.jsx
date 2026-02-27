import { TrendingUp, TrendingDown, Minus } from "lucide-react";

/**
 * A reusable KPI card with value, trend, and optional Recharts sparkline.
 */
export default function KpiCard({ title, value, change, changeType = "neutral", icon: Icon, color = "blue" }) {
  const colorMap = {
    blue: "from-primary-500 to-primary-600",
    green: "from-success-500 to-success-600",
    amber: "from-warning-500 to-warning-600",
    red: "from-danger-500 to-danger-600",
    purple: "from-accent-500 to-accent-600",
  };

  const TrendIcon = changeType === "up" ? TrendingUp : changeType === "down" ? TrendingDown : Minus;
  const trendColor = changeType === "up" ? "text-success-600" : changeType === "down" ? "text-danger-500" : "text-surface-700";

  return (
    <div className="card group hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-surface-700 font-medium">{title}</p>
          <p className="text-2xl font-bold text-surface-900 mt-1">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${trendColor}`}>
              <TrendIcon size={14} />
              <span>{change}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colorMap[color]} text-white shadow-lg`}>
            <Icon size={22} />
          </div>
        )}
      </div>
    </div>
  );
}
