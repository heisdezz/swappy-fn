import { useState } from "react";
import {
  AlertCircle,
  ArrowLeftRight,
  CheckCircle2,
  Lock,
  MapPin,
  ShieldAlert,
  X,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { pb } from "../../client/pb";
import type { ItemDetailRecord } from "../../server/listings";

interface SwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetItem: ItemDetailRecord;
}

export interface SwapProposalFormValues {
  offeredModel: string;
  offeredStorage: string;
  offeredBattery: number;
  offeredCondition: string;
  offeredIssues?: string;
  cashDirection: "i_add_cash" | "seller_adds_cash" | "even_swap";
  cashAmount: number;
  meetingSpot: string;
  message?: string;
}

const popularSwapModels = [
  "iPhone 15 Pro",
  "iPhone 15",
  "iPhone 14 Pro Max",
  "iPhone 14 Pro",
  "iPhone 14",
  "iPhone 13 Pro Max",
  "iPhone 13 Pro",
  "iPhone 13",
  "iPhone 12 Pro Max",
  "iPhone 12",
  "iPhone 11 Pro Max",
  "iPhone 11",
];

export function SwapModal({ isOpen, onClose, targetItem }: SwapModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [proposalSent, setProposalSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const isAuthenticated = pb.authStore.isValid && !!pb.authStore.record?.id;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SwapProposalFormValues>({
    defaultValues: {
      offeredModel: "iPhone 14 Pro",
      offeredStorage: "128GB",
      offeredBattery: 87,
      offeredCondition: "flawless",
      offeredIssues: "None, clean device",
      cashDirection: "i_add_cash",
      cashAmount: 200000,
      meetingSpot: "Ikeja City Mall (Public Food Court)",
      message: "Available for inspection at a public mall.",
    },
  });

  const selectedModel = watch("offeredModel");
  const selectedCashDirection = watch("cashDirection");
  const meetingSpotValue = watch("meetingSpot");

  if (!isOpen) return null;

  const onProposalSubmit = async (data: SwapProposalFormValues) => {
    if (!isAuthenticated) return;
    setSubmitting(true);
    setApiError(null);

    try {
      const backendUrl =
        import.meta.env.VITE_POCKETBASE_URL || "http://127.0.0.1:8090";
      const token = pb.authStore.token;

      // Calculate cash adjustment: positive if buyer adds cash, negative if seller adds cash
      let adjustment = 0;
      if (data.cashDirection === "i_add_cash") {
        adjustment = Number(data.cashAmount || 0);
      } else if (data.cashDirection === "seller_adds_cash") {
        adjustment = -Number(data.cashAmount || 0);
      }

      const combinedMessage = `${data.message ? data.message + " " : ""}Proposed inspection spot: ${data.meetingSpot}`;

      const res = await fetch(`${backendUrl}/api/swap/propose`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetItemId: targetItem.id,
          offeredModel: data.offeredModel,
          offeredStorage: data.offeredStorage,
          offeredColor: "Standard",
          offeredBattery: Number(data.offeredBattery),
          offeredCondition: data.offeredCondition,
          offeredIssues: data.offeredIssues || "",
          cashAdjustment: adjustment,
          message: combinedMessage,
        }),
      });

      const resJson = await res.json();
      if (!res.ok) {
        throw new Error(resJson.message || "Failed to submit swap proposal");
      }

      setProposalSent(true);
      setStep(4);
    } catch (err: any) {
      setApiError(err.message || "An error occurred while sending proposal");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setProposalSent(false);
    setApiError(null);
    setStep(1);
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-base-100 rounded-3xl border border-base-300 shadow-2xl max-w-lg w-full overflow-hidden text-base-content animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-base-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center font-bold">
              <ArrowLeftRight className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-extrabold text-base text-base-content">
                Propose Device Swap
              </h3>
              <p className="text-xs text-base-content/60">
                Trading for: {targetItem.title || "iPhone"}
              </p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="btn btn-ghost btn-circle btn-sm"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!isAuthenticated ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-lg text-base-content">
                Sign in to Propose Swap
              </h4>
              <p className="text-xs text-base-content/70 max-w-xs mx-auto">
                Swappy connects verified users for secure device trade-ins. Sign
                in to send your iPhone specifications to the seller.
              </p>
            </div>
            <div className="pt-2">
              <a
                href={`/app/auth/login?redirect=/items/${targetItem.id}`}
                className="btn btn-primary rounded-xl font-bold px-6 text-sm"
              >
                Sign In to Account
              </a>
            </div>
          </div>
        ) : (
          <>
            {/* Wizard Step Progress */}
            {!proposalSent && (
              <div className="px-6 pt-3 pb-1 border-b border-base-200 bg-base-200/40 flex items-center justify-between text-xs font-semibold">
                <span
                  className={
                    step >= 1
                      ? "text-primary font-bold"
                      : "text-base-content/40"
                  }
                >
                  1. Your Device
                </span>
                <span>&rarr;</span>
                <span
                  className={
                    step >= 2
                      ? "text-primary font-bold"
                      : "text-base-content/40"
                  }
                >
                  2. Cash Adjustment
                </span>
                <span>&rarr;</span>
                <span
                  className={
                    step >= 3
                      ? "text-primary font-bold"
                      : "text-base-content/40"
                  }
                >
                  3. Meeting Spot
                </span>
              </div>
            )}

            {apiError && (
              <div className="mx-6 mt-4 p-3 bg-error/15 border border-error/30 text-error rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onProposalSubmit)} noValidate>
              {/* Content Area */}
              <div className="p-6">
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-base-content">
                        Device You Are Offering
                      </label>
                      <select
                        {...register("offeredModel")}
                        className="select select-bordered w-full rounded-xl text-sm"
                      >
                        {popularSwapModels.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-base-content">
                          Storage
                        </label>
                        <select
                          {...register("offeredStorage")}
                          className="select select-bordered w-full rounded-xl text-sm"
                        >
                          <option value="64GB">64GB</option>
                          <option value="128GB">128GB</option>
                          <option value="256GB">256GB</option>
                          <option value="512GB">512GB</option>
                          <option value="1TB">1TB</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-base-content">
                          Battery Health (%)
                        </label>
                        <input
                          type="number"
                          min="50"
                          max="100"
                          {...register("offeredBattery", {
                            valueAsNumber: true,
                            min: 50,
                            max: 100,
                          })}
                          className="input input-bordered w-full rounded-xl text-sm"
                          placeholder="e.g. 88"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-base-content">
                        Cosmetic Condition
                      </label>
                      <select
                        {...register("offeredCondition")}
                        className="select select-bordered w-full rounded-xl text-sm"
                      >
                        <option value="flawless">
                          Flawless (No Scratches)
                        </option>
                        <option value="open_box">Open Box / Like New</option>
                        <option value="good">Good (Light signs of use)</option>
                        <option value="fair">
                          Fair (Visible marks or wear)
                        </option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-base-content">
                        Condition Notes / Defects (Optional)
                      </label>
                      <input
                        type="text"
                        {...register("offeredIssues")}
                        className="input input-bordered w-full rounded-xl text-sm"
                        placeholder="e.g. Minor scuff on bottom bezel, TrueTone intact"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="btn btn-primary btn-block rounded-xl font-bold"
                      >
                        Continue to Cash Adjustment
                      </button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-base-content">
                        Balance Difference
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setValue("cashDirection", "i_add_cash")
                          }
                          className={`btn btn-xs rounded-lg font-bold ${
                            selectedCashDirection === "i_add_cash"
                              ? "btn-secondary text-secondary-content"
                              : "btn-outline border-base-300"
                          }`}
                        >
                          I Add Cash
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setValue("cashDirection", "seller_adds_cash")
                          }
                          className={`btn btn-xs rounded-lg font-bold ${
                            selectedCashDirection === "seller_adds_cash"
                              ? "btn-secondary text-secondary-content"
                              : "btn-outline border-base-300"
                          }`}
                        >
                          Seller Adds
                        </button>
                        <button
                          type="button"
                          onClick={() => setValue("cashDirection", "even_swap")}
                          className={`btn btn-xs rounded-lg font-bold ${
                            selectedCashDirection === "even_swap"
                              ? "btn-secondary text-secondary-content"
                              : "btn-outline border-base-300"
                          }`}
                        >
                          Even Swap
                        </button>
                      </div>
                    </div>

                    {selectedCashDirection !== "even_swap" && (
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-base-content">
                          Cash Amount (NGN)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-sm text-base-content/60">
                            &#8358;
                          </span>
                          <input
                            type="number"
                            step="5000"
                            {...register("cashAmount", { valueAsNumber: true })}
                            className="input input-bordered w-full pl-8 rounded-xl font-mono font-bold text-sm"
                            placeholder="200000"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="btn btn-ghost rounded-xl font-bold flex-1"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="btn btn-primary rounded-xl font-bold flex-1"
                      >
                        Inspection Spot
                      </button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-base-content flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        <span>Proposed Public Inspection Meeting Point</span>
                      </label>
                      <input
                        type="text"
                        {...register("meetingSpot", {
                          required:
                            "Please provide a safe public meeting spot.",
                        })}
                        className={`input input-bordered w-full rounded-xl text-sm ${
                          errors.meetingSpot
                            ? "border-error focus:border-error"
                            : ""
                        }`}
                        placeholder="e.g. Ikeja City Mall, Maryland Mall"
                      />
                      {errors.meetingSpot && (
                        <span className="text-[11px] font-semibold text-error pl-1 block">
                          {errors.meetingSpot.message}
                        </span>
                      )}
                    </div>

                    {/* Safety Warning */}
                    <div className="p-3.5 rounded-2xl bg-warning/15 border border-warning/30 flex items-start gap-2.5 text-xs text-base-content/80">
                      <ShieldAlert className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                      <p className="leading-snug">
                        Always inspect both devices thoroughly in a safe, public
                        spot. Check Face ID, cameras, battery settings, and
                        ensure both iCloud accounts are signed out.
                      </p>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => setStep(2)}
                        className="btn btn-ghost rounded-xl font-bold flex-1"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn btn-secondary text-secondary-content rounded-xl font-bold flex-1"
                      >
                        {submitting ? "Sending..." : "Send Proposal"}
                      </button>
                    </div>
                  </div>
                )}

                {step === 4 && proposalSent && (
                  <div className="text-center py-6 space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-success/20 text-success mx-auto flex items-center justify-center">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-lg font-black text-base-content">
                        Swap Proposal Sent!
                      </h4>
                      <p className="text-xs text-base-content/70 max-w-xs mx-auto">
                        The seller has received your swap offer for their{" "}
                        {targetItem.title}. You can track this proposal in your
                        dashboard.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-base-200/50 border border-base-300 text-xs text-left space-y-1">
                      <div className="font-bold text-base-content">
                        Summary:
                      </div>
                      <div className="text-base-content/70">
                        Offered: {selectedModel} ({watch("offeredStorage")})
                      </div>
                      <div className="text-base-content/70">
                        Location: {meetingSpotValue}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleResetAndClose}
                      className="btn btn-primary rounded-xl font-bold w-full"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
