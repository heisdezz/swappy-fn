import { Battery, BatteryCharging, BatteryWarning } from "lucide-react";

interface BatteryBadgeProps {
  percentage?: number;
  className?: string;
}

export function BatteryBadge({
  percentage,
  className = "",
}: BatteryBadgeProps) {
  if (percentage === undefined || percentage === null) {
    return null;
  }

  const badgeColor =
    percentage >= 85
      ? "badge-success text-success-content"
      : percentage >= 75
        ? "badge-warning text-warning-content"
        : "badge-error text-error-content";

  const Icon =
    percentage >= 85
      ? BatteryCharging
      : percentage >= 75
        ? Battery
        : BatteryWarning;

  return (
    <span
      className={`badge badge-sm font-bold text-xs inline-flex items-center gap-1.5 px-2.5 py-1 ${badgeColor} ${className}`}
      title={`Battery Health: ${percentage}%`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{percentage}%</span>
    </span>
  );
}
