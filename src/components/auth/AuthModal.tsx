import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";
import Modal from "../modals/DialogModal";

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

  const handleSuccess = () => {
    if (onSuccess) onSuccess();
    onClose();
  };

  const modalTitle = (
    <div className="space-y-1">
      <h2 className="text-xl font-black text-base-content tracking-tight">
        {title ||
          (tab === "login" ? "Sign In to Swappy" : "Create Your Account")}
      </h2>
      <p className="text-xs text-base-content/70 font-normal">
        {subtitle ||
          (tab === "login"
            ? "Access verified iPhone deals and coordinate swaps."
            : "Join verified buyers and iPhone dealers across Nigeria.")}
      </p>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      boxClassName="max-w-md"
    >
      <div className="space-y-5 pt-2">
        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-base-200 border border-base-300">
          <button
            type="button"
            onClick={() => setTab("login")}
            className={`py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
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
            className={`py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
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
    </Modal>
  );
}
