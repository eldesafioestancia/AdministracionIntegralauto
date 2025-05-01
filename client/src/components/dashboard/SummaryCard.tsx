import { ReactNode } from "react";

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: "primary" | "secondary" | "success" | "error" | "warning" | "info";
  change?: {
    value: number;
    type: "increase" | "decrease";
  };
}

export default function SummaryCard({
  title,
  value,
  icon,
  color,
  change,
}: SummaryCardProps) {
  const colorClasses = {
    primary: "bg-primary text-primary",
    secondary: "bg-secondary text-secondary",
    success: "bg-success text-success",
    error: "bg-destructive text-destructive",
    warning: "bg-warning text-warning",
    info: "bg-info text-info",
  };

  const changeColorClass = change?.type === "increase" ? "text-success" : "text-destructive";
  const changeIconClass = change?.type === "increase" ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line";

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-neutral-200">
      <div className="flex items-center">
        <div className={`flex-shrink-0 rounded-full p-3 ${colorClasses[color]} bg-opacity-10`}>
          {icon}
        </div>
        <div className="ml-4">
          <h2 className="text-sm font-medium text-neutral-400">{title}</h2>
          <p className="text-2xl font-semibold text-neutral-500">{value}</p>
        </div>
      </div>
      {change && (
        <div className="mt-3">
          <div className="flex items-center">
            <span className={`${changeColorClass} text-xs flex items-center`}>
              <i className={changeIconClass}></i> {Math.abs(change.value)}%
            </span>
            <span className="text-xs text-neutral-400 ml-2">vs. mes anterior</span>
          </div>
        </div>
      )}
    </div>
  );
}
