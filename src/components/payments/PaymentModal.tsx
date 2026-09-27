import {
  AlertCircle,
  Check,
  CreditCard,
  Lock,
  Sparkles,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { pb } from "../../client/pb";
import { extract_message } from "../../helpers/api";
import { getItemCardImageUrl } from "../../helpers/images";
import Modal from "../modals/DialogModal";

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "subscription" | "promotion";
  item?: {
    id: string;
    title?: string;
    price?: number;
    images?: string[];
    battery_health?: number;
    storage?: string;
  } | null;
}

export function PaymentModal({
  isOpen,
  onClose,
  type,
  item,
}: PaymentModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>(
    type === "subscription" ? "pro_seller" : "top_search_7d",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInitializePayment = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (!pb.authStore.isValid || !pb.authStore.token) {
        throw new Error("Please log in before completing this payment.");
      }

      const endpoint =
        type === "subscription"
          ? "/api/payment/subscribe"
          : "/api/payment/promote";

      const payload =
        type === "subscription"
          ? { plan: selectedPlan }
          : { itemId: item?.id, tier: selectedPlan };

      const backendUrl =
        import.meta.env.VITE_POCKETBASE_URL ||
        process.env.POCKETBASE_URL ||
        "http://127.0.0.1:8090";

      const response = await fetch(`${backendUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${pb.authStore.token}`,
        },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(
          resData.error || resData.message || "Failed to initialize payment",
        );
      }

      if (resData.authorization_url) {
        window.location.href = resData.authorization_url;
      } else {
        throw new Error(
          "No authorization URL returned from payment processor. Please check Paystack keys.",
        );
      }
    } catch (err: any) {
      console.error("Payment init error:", err);
      setErrorMessage(extract_message(err));
      setIsLoading(false);
    }
  };

  const modalTitle = (
    <div className="flex items-center gap-2.5">
      {type === "subscription" ? (
        <div className="w-10 h-10 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
      ) : (
        <div className="w-10 h-10 rounded-2xl bg-secondary/20 text-secondary flex items-center justify-center shrink-0">
          <Zap className="w-5 h-5" />
        </div>
      )}
      <div>
        <h2 className="text-xl font-black text-base-content tracking-tight">
          {type === "subscription"
            ? "Verified Merchant Pro"
            : "Spotlight iPhone Listing"}
        </h2>
        <p className="text-xs text-base-content/60 font-normal">
          {type === "subscription"
            ? "Elevate your dealership with verified badges and top search reach"
            : "Boost visibility and receive 5x more buyer and swap inquiries"}
        </p>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      boxClassName="max-w-lg"
    >
      <div className="space-y-6 pt-2">
        {/* Listing preview if promotion */}
        {type === "promotion" && item && (
          <div className="p-3.5 rounded-2xl bg-base-200/60 border border-base-300/60 flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-base-100 p-1 border border-base-300 shrink-0 overflow-hidden">
              <img
                src={getItemCardImageUrl(item as any, "150x150")}
                alt={item.title || "iPhone"}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-extrabold text-sm text-base-content truncate">
                {item.title || "Selected iPhone"}
              </div>
              <div className="text-xs text-primary font-black font-mono">
                {item.price
                  ? new Intl.NumberFormat("en-NG", {
                      style: "currency",
                      currency: "NGN",
                      maximumFractionDigits: 0,
                    }).format(item.price)
                  : "₦---"}
              </div>
            </div>
          </div>
        )}

        {/* Pricing Options */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-base-content/70 uppercase tracking-wider">
            Select Your Package
          </div>

          {type === "subscription" ? (
            <div className="space-y-2.5">
              <div
                onClick={() => setSelectedPlan("pro_seller")}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  selectedPlan === "pro_seller"
                    ? "border-primary bg-primary/5 shadow-xs"
                    : "border-base-300 hover:border-base-content/30"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-base-content">
                      Merchant Pro Monthly
                    </span>
                    <span className="badge badge-primary badge-sm font-bold text-[10px]">
                      Most Popular
                    </span>
                  </div>
                  <p className="text-xs text-base-content/65">
                    Verified badge, unlimited inventory listings, priority
                    search
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-black text-primary font-mono">
                    ₦15,000
                  </div>
                  <div className="text-[10px] text-base-content/50">
                    / month
                  </div>
                </div>
              </div>

              <div
                onClick={() => setSelectedPlan("enterprise_quarterly")}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between opacity-80 ${
                  selectedPlan === "enterprise_quarterly"
                    ? "border-primary bg-primary/5 shadow-xs opacity-100"
                    : "border-base-300 hover:border-base-content/30"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-base-content">
                      Hub Powerhouse (3 Months)
                    </span>
                    <span className="badge badge-accent badge-sm font-bold text-[10px]">
                      Save 15%
                    </span>
                  </div>
                  <p className="text-xs text-base-content/65">
                    Dedicated WhatsApp concierge, physical store highlight tag
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-black text-base-content font-mono">
                    ₦38,250
                  </div>
                  <div className="text-[10px] text-base-content/50">
                    / quarter
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div
                onClick={() => setSelectedPlan("top_search_7d")}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  selectedPlan === "top_search_7d"
                    ? "border-secondary bg-secondary/5 shadow-xs"
                    : "border-base-300 hover:border-base-content/30"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-base-content">
                      7-Day Spotlight
                    </span>
                    <span className="badge badge-secondary badge-sm font-bold text-[10px]">
                      Top Choice
                    </span>
                  </div>
                  <p className="text-xs text-base-content/65">
                    Sticky placement in homepage and catalog feed for a full
                    week
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-black text-secondary font-mono">
                    ₦5,000
                  </div>
                  <div className="text-[10px] text-base-content/50">
                    one-time
                  </div>
                </div>
              </div>

              <div
                onClick={() => setSelectedPlan("homepage_feature_14d")}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  selectedPlan === "homepage_feature_14d"
                    ? "border-secondary bg-secondary/5 shadow-xs"
                    : "border-base-300 hover:border-base-content/30"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-base-content">
                      14-Day Prime Spotlight
                    </span>
                  </div>
                  <p className="text-xs text-base-content/65">
                    Maximum exposure banner + WhatsApp recommendation push
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-black text-base-content font-mono">
                    ₦9,000
                  </div>
                  <div className="text-[10px] text-base-content/50">
                    one-time
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Feature list */}
        <div className="p-4 rounded-2xl bg-base-200/40 border border-base-300/40 space-y-2">
          <div className="text-xs font-bold text-base-content flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-success" />
            <span>Guaranteed Instant Activation</span>
          </div>
          <p className="text-[11px] text-base-content/65 leading-relaxed">
            Payments are securely routed via Paystack. Your spotlight rank or
            verified dealer perks activate immediately upon reference
            verification.
          </p>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-error/10 border border-error/20 text-error text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-base-content/50">
            <Lock className="w-3.5 h-3.5" />
            <span>256-bit encrypted</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="btn btn-ghost btn-sm rounded-xl font-bold text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleInitializePayment}
              disabled={isLoading}
              className={`btn btn-sm rounded-xl font-black px-5 text-xs shadow-md inline-flex items-center gap-2 ${
                type === "subscription" ? "btn-primary" : "btn-secondary"
              }`}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-xs" />
                  <span>Redirecting...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Pay with Paystack</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
