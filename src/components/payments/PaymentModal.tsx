import {
  AlertCircle,
  Check,
  CreditCard,
  Lock,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { pb } from "../../client/pb";
import { extract_message } from "../../helpers/api";
import { getItemCardImageUrl } from "../../helpers/images";

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

  if (!isOpen) return null;

  const handleInitializePayment = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (!pb.authStore.isValid || !pb.authStore.token) {
        throw new Error("Please log in before completing this payment.");
      }

      const callbackUrl = `${window.location.origin}/payment/callback`;

      const payload =
        type === "subscription"
          ? {
              type: "subscription",
              plan: selectedPlan,
              callbackUrl,
            }
          : {
              type: "promotion",
              itemId: item?.id,
              tier: selectedPlan,
              callbackUrl,
            };

      const res = await fetch(`${pb.baseUrl}/api/payments/initialize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${pb.authStore.token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Payment initialization failed (${res.status})`,
        );
      }

      const authUrl =
        data?.authorization_url ||
        data?.data?.authorization_url ||
        data?.data?.link ||
        data?.url;

      if (authUrl) {
        window.location.href = authUrl;
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-base-100 rounded-3xl border border-base-300 max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-base-content/70 hover:text-base-content"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {type === "subscription" ? (
              <div className="w-10 h-10 rounded-2xl bg-primary/20 text-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-secondary/20 text-secondary flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-black text-base-content tracking-tight">
                {type === "subscription"
                  ? "Verified Merchant Pro"
                  : "Spotlight iPhone Listing"}
              </h2>
              <p className="text-xs text-base-content/60">
                {type === "subscription"
                  ? "Elevate your dealership with verified badges and top search reach"
                  : "Boost visibility and receive 5x more buyer and swap inquiries"}
              </p>
            </div>
          </div>
        </div>

        {/* Listing preview if promotion */}
        {type === "promotion" && item && (
          <div className="p-3.5 rounded-2xl bg-base-200/60 border border-base-300/60 flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-base-100 p-1 border border-base-300 shrink-0 overflow-hidden">
              <img
                src={getItemCardImageUrl(item, "100x100")}
                alt={item.title || "iPhone"}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/iphone_1.png";
                }}
              />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-xs sm:text-sm text-base-content truncate">
                {item.title || "iPhone Listing"}
              </h3>
              <div className="flex items-center gap-2 text-xs text-base-content/60 mt-0.5">
                {item.price && (
                  <span className="font-black text-primary font-mono">
                    ₦{item.price.toLocaleString()}
                  </span>
                )}
                {item.storage && <span>&bull; {item.storage}</span>}
                {item.battery_health && (
                  <span>&bull; {item.battery_health}% Batt</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="alert alert-error rounded-2xl text-xs font-bold text-error-content flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Plan / Tier Selection */}
        <div className="space-y-3">
          <label className="text-xs font-extrabold text-base-content/70 uppercase tracking-wider">
            Select Plan Duration
          </label>

          {type === "subscription" ? (
            <div className="space-y-2.5">
              <div
                onClick={() => setSelectedPlan("pro_seller")}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  selectedPlan === "pro_seller"
                    ? "border-primary bg-primary/5 shadow-xs"
                    : "border-base-300 hover:border-base-content/30"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-base-content">
                      Monthly Merchant Pro
                    </span>
                    <span className="badge badge-primary badge-xs font-bold">
                      Most Popular
                    </span>
                  </div>
                  <p className="text-xs text-base-content/60">
                    Unlimited active listings, verified dealer shield, priority
                    support
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-black text-lg text-primary font-mono">
                    ₦15,000
                  </div>
                  <span className="text-[11px] text-base-content/50">
                    per month
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {/* Option 1: 7-Day Top Search */}
              <div
                onClick={() => setSelectedPlan("top_search_7d")}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  selectedPlan === "top_search_7d"
                    ? "border-primary bg-primary/5 shadow-xs"
                    : "border-base-300 hover:border-base-content/30"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-base-content">
                      Top Search Spotlight (7 Days)
                    </span>
                    <span className="badge badge-accent badge-xs font-bold">
                      7 Days
                    </span>
                  </div>
                  <p className="text-xs text-base-content/60">
                    Pinned to top of explore catalog and iPhone category filters
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-black text-lg text-primary font-mono">
                    ₦5,000
                  </div>
                  <span className="text-[11px] text-base-content/50">
                    one-time
                  </span>
                </div>
              </div>

              {/* Option 2: 14-Day Prime Blast */}
              <div
                onClick={() => setSelectedPlan("top_search_14d")}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  selectedPlan === "top_search_14d"
                    ? "border-primary bg-primary/5 shadow-xs"
                    : "border-base-300 hover:border-base-content/30"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-base-content">
                      Prime Homepage + Catalog (14 Days)
                    </span>
                    <span className="badge badge-secondary badge-xs font-bold">
                      2 Weeks
                    </span>
                  </div>
                  <p className="text-xs text-base-content/60">
                    Homepage featured ribbon and persistent category priority
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-black text-lg text-primary font-mono">
                    ₦9,000
                  </div>
                  <span className="text-[11px] text-base-content/50">
                    one-time
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Benefits Checklist */}
        <div className="p-4 rounded-2xl bg-base-200/50 space-y-2 border border-base-300/50">
          <span className="text-xs font-bold text-base-content block mb-1">
            Included with this plan:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-base-content/70">
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-success shrink-0" />
              <span>Priority search placement</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-success shrink-0" />
              <span>Direct WhatsApp buyer clicks</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-success shrink-0" />
              <span>Verified merchant credentials</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-success shrink-0" />
              <span>Escrow & trade-in protection</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-3">
          <button
            onClick={handleInitializePayment}
            disabled={isLoading}
            className="btn btn-primary rounded-2xl font-black w-full shadow-md text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-sm" />
                <span>Connecting to Paystack...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Pay with Paystack (NGN)</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-base-content/50 text-center">
            <Lock className="w-3 h-3 text-success" />
            <span>
              256-bit encrypted card, USSD, and bank transfer via Paystack
              Nigeria
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
