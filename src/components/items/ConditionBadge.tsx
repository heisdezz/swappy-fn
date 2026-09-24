interface ConditionBadgeProps {
  condition?: string;
  className?: string;
}

const conditionLabels: Record<string, { label: string; badgeClass: string }> = {
  brand_new: { label: "Brand New", badgeClass: "badge-primary" },
  open_box: { label: "Open Box", badgeClass: "badge-secondary" },
  flawless: { label: "Flawless", badgeClass: "badge-info" },
  good: { label: "Good", badgeClass: "badge-accent" },
  fair: { label: "Fair", badgeClass: "badge-warning" },
  cracked_screen: { label: "Cracked Glass", badgeClass: "badge-error" },
  for_parts: { label: "For Parts", badgeClass: "badge-neutral" },
};

export function ConditionBadge({ condition, className = "" }: ConditionBadgeProps) {
  if (!condition) return null;

  const config = conditionLabels[condition] || {
    label: condition.replace(/_/g, " "),
    badgeClass: "badge-ghost",
  };

  return (
    <span className={`badge badge-sm font-medium ${config.badgeClass} ${className}`}>
      {config.label}
    </span>
  );
}
