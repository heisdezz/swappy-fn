import {
  CardSim,
  CheckCircle2,
  HardDrive,
  Palette,
  ScanFace,
  Shield,
  Sparkles,
  Sun,
  Unlock,
  Zap,
} from "lucide-react";
import type { ItemDetailRecord } from "../../server/listings";

interface DeviceSpecsMatrixProps {
  item: ItemDetailRecord;
}

export function DeviceSpecsMatrix({ item }: DeviceSpecsMatrixProps) {
  const carrierLabel =
    item.carrier_status === "factory_unlocked"
      ? "Factory Unlocked"
      : item.carrier_status === "chip_unlocked"
        ? "Chip Unlocked (RSIM)"
        : "Network Locked";

  const simLabel =
    item.sim_type === "physical_sim_plus_esim"
      ? "Physical SIM + eSIM"
      : item.sim_type === "dual_physical_sim"
        ? "Dual Physical SIM"
        : "Dual eSIM Only";

  const conditionLabel =
    item.condition === "flawless"
      ? "Flawless (No Scratches)"
      : item.condition === "open_box"
        ? "Open Box / Pristine"
        : item.condition === "good"
          ? "Good (Minor Wear)"
          : item.condition === "fair"
            ? "Fair (Visible Marks)"
            : item.condition || "Pre-Owned";

  const specs = [
    {
      label: "Battery Health",
      value: item.battery_health
        ? `${item.battery_health}% Original`
        : "Not specified",
      icon: Zap,
      badgeClass:
        (item.battery_health || 0) >= 85
          ? "text-success"
          : (item.battery_health || 0) >= 80
            ? "text-warning"
            : "text-error",
    },
    {
      label: "Storage Capacity",
      value: item.storage || "Not specified",
      icon: HardDrive,
      badgeClass: "text-base-content",
    },
    {
      label: "Carrier Status",
      value: carrierLabel,
      icon: Unlock,
      badgeClass:
        item.carrier_status === "factory_unlocked"
          ? "text-success"
          : "text-warning",
    },
    {
      label: "SIM Configuration",
      value: simLabel,
      icon: CardSim,
      badgeClass: "text-base-content",
    },
    {
      label: "Face ID",
      value:
        item.has_face_id !== false ? "Functional & Tested" : "Sensor Fault",
      icon: ScanFace,
      badgeClass: item.has_face_id !== false ? "text-success" : "text-error",
    },
    {
      label: "True Tone",
      value: item.has_truetone !== false ? "Active & Functional" : "Disabled",
      icon: Sun,
      badgeClass: item.has_truetone !== false ? "text-success" : "text-warning",
    },
    {
      label: "Cosmetic Condition",
      value: conditionLabel,
      icon: Sparkles,
      badgeClass: "text-base-content",
    },
    {
      label: "Color Finish",
      value: item.color || "Apple Original",
      icon: Palette,
      badgeClass: "text-base-content",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/80">
          Hardware & Diagnostic Transparency
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {specs.map((spec) => {
          const Icon = spec.icon;
          return (
            <div
              key={spec.label}
              className="bg-base-200/60 p-3 rounded-2xl border border-base-300 space-y-1.5 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-base-content/60">
                  {spec.label}
                </span>
                <Icon className={`w-3.5 h-3.5 ${spec.badgeClass}`} />
              </div>

              <div className="text-xs font-extrabold text-base-content leading-tight flex items-center gap-1">
                {spec.badgeClass.includes("text-success") && (
                  <CheckCircle2 className="w-3 h-3 text-success flex-shrink-0" />
                )}
                <span className="truncate">{spec.value}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
