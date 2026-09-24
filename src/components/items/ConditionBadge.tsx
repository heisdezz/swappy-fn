interface ConditionBadgeProps {
  condition?: string;
  className?: string;
}

const conditionLabels: Record<string, { label: string; badgeClass: string }> = {
  brand_new: {
    label: "Brand New",
    badgeClass: "badge-primary text-primary-content",
  },
  open_box: {
    label: "Open Box",
    badgeClass: "badge-secondary text-secondary-content",
  },
  flawless: { label: "Flawless", badgeClass: "badge-info text-info-content" },
  good: { label: "Good", badgeClass: "badge-accent text-accent-content" },
  fair: { label: "Fair", badgeClass: "badge-warning text-warning-content" },
  cracked_screen: {
    label: "Cracked Glass",
    badgeClass: "badge-error text-error-content",
  },
  for_parts: {
    label: "For Parts",
    badgeClass: "badge-neutral text-neutral-content",
  },
};

export function ConditionBadge({
  condition,
  className = "",
}: ConditionBadgeProps) {
  if (!condition) return null;

  const config = conditionLabels[condition] || {
    label: condition.replace(/_/g, " "),
    badgeClass: "badge-ghost",
  };

  return (
    <span
      className={`badge badge-sm font-bold text-xs px-2.5 py-1 ${config.badgeClass} ${className}`}
    >
      {config.label}
    </span>
  );
}
