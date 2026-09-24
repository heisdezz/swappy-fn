import { ShieldAlert } from "lucide-react";

interface SafetyAlertProps {
  className?: string;
}

export function SafetyAlert({ className = "" }: SafetyAlertProps) {
  return (
    <div
      role="alert"
      className={`alert alert-warning text-xs shadow-sm flex items-start gap-2.5 rounded-2xl ${className}`}
    >
      <ShieldAlert className="w-5 h-5 flex-shrink-0 text-warning-content mt-0.5" />
      <div className="space-y-1 text-warning-content">
        <span className="font-bold block">In-Person Safety Precautions</span>
        <ul className="list-disc list-inside space-y-0.5 text-xs opacity-90">
          <li>Never make advance bank transfers before physical inspection.</li>
          <li>Meet in secure, public places (e.g. major malls or tech complexes).</li>
          <li>Verify iCloud sign-out in device Settings before completing trade.</li>
          <li>Test cameras, microphones, charging port, and SIM detection in person.</li>
        </ul>
      </div>
    </div>
  );
}
