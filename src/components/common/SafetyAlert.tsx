import { ShieldAlert } from "lucide-react";

interface SafetyAlertProps {
  className?: string;
}

export function SafetyAlert({ className = "" }: SafetyAlertProps) {
  return (
    <div
      role="alert"
      className={`alert alert-warning shadow-xs flex items-start gap-3 rounded-3xl p-5 ${className}`}
    >
      <ShieldAlert className="w-5 h-5 flex-shrink-0 text-warning-content mt-0.5" />
      <div className="space-y-1.5 text-warning-content">
        <span className="font-extrabold text-sm sm:text-base block">
          In-Person Safety Precautions
        </span>
        <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm opacity-90 leading-relaxed font-medium">
          <li>Never make advance bank transfers before physical inspection.</li>
          <li>
            Meet in secure, public places (such as major shopping malls or tech
            plaza arcades).
          </li>
          <li>
            Verify iCloud sign-out in device Settings before completing trade.
          </li>
          <li>
            Test cameras, microphones, charging port, and SIM detection in
            person.
          </li>
        </ul>
      </div>
    </div>
  );
}
