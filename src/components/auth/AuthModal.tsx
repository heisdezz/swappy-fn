import { X } from "lucide-react";
import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "signup";
  onSuccess?: () => void;
  title?: string;
  subtitle?: string;
}

export function AuthModal({
  isOpen,
  onClose,
  defaultTab = "login",
  onSuccess,
  title,
  subtitle,
}: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "signup">(defaultTab);

  if (!isOpen) return null;

  const handleSuccess = () => {
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-base-100 rounded-3xl border border-base-300 shadow-2xl p-6 sm:p-8 z-10 animate-in zoom-in-95 duration-200 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header with Close */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-base-content tracking-tight">
              {title || (tab === "login" ? "Sign In to Swappy" : "Create Your Account")}
            </h2>
            <p className="text-xs text-base-content/70">
              {subtitle ||
                (tab === "login"
                  ? "Access verified iPhone deals and coordinate swaps."
                  : "Join verified buyers and iPhone dealers across Nigeria.")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-square rounded-xl text-base-content/60 hover:text-base-content"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-base-200 border border-base-300">
          <button
            type="button"
            onClick={() => setTab("login")}
            className={`py-2 text-xs font-extrabold rounded-xl transition-all ${
              tab === "login"
                ? "bg-base-100 text-base-content shadow-sm"
                : "text-base-content/60 hover:text-base-content"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setTab("signup")}
            className={`py-2 text-xs font-extrabold rounded-xl transition-all ${
              tab === "signup"
                ? "bg-base-100 text-base-content shadow-sm"
                : "text-base-content/60 hover:text-base-content"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Forms */}
        {tab === "login" ? (
          <LoginForm onSuccess={handleSuccess} />
        ) : (
          <SignupForm onSuccess={handleSuccess} />
        )}
      </div>
    </div>
  );
}
