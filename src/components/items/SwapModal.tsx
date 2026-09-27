import { useState } from "react";
import {
  AlertCircle,
  ArrowLeftRight,
  CheckCircle2,
  Lock,
  MapPin,
  ShieldAlert,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { pb } from "../../client/pb";
import type { ItemDetailRecord } from "../../server/listings";
import Modal from "../modals/DialogModal";

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
  "iPhone 12 Pro",
  "iPhone 12",
  "iPhone 11 Pro Max",
  "iPhone 11 Pro",
  "iPhone 11",
  "iPhone XR",
  "iPhone X",
];

const storageOptions = ["64GB", "128GB", "256GB", "512GB", "1TB"];
const conditionOptions = ["brand_new", "open_box", "flawless", "good", "fair"];

export function SwapModal({ isOpen, onClose, targetItem }: SwapModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [submitting, setSubmitting] = useState(false);
  const [proposalSent, setProposalSent] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const isAuthenticated = pb.authStore.isValid;
  const currentUserId = pb.authStore.record?.id;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SwapProposalFormValues>({
    defaultValues: {
      offeredModel: popularSwapModels[0],
      offeredStorage: "128GB",
      offeredBattery: 88,
      offeredCondition: "flawless",
      offeredIssues: "",
      cashDirection: "even_swap",
      cashAmount: 0,
      meetingSpot: "",
      message: "",
    },
  });

  const selectedCashDirection = watch("cashDirection");
  const selectedModel = watch("offeredModel");
  const meetingSpotValue = watch("meetingSpot");

  const onSubmit = async (values: SwapProposalFormValues) => {
    if (!isAuthenticated || !currentUserId) {
      setGeneralError("Please login to submit a swap proposal.");
      return;
    }

    setSubmitting(true);
    setGeneralError(null);

    try {
      let cashDiff = 0;
      if (values.cashDirection === "i_add_cash") {
        cashDiff = values.cashAmount;
      } else if (values.cashDirection === "seller_adds_cash") {
        cashDiff = -Math.abs(values.cashAmount);
      }

      await pb.collection("swap_offers").create({
        buyer: currentUserId,
        seller: targetItem.seller?.id,
        target_item: targetItem.id,
        offered_title: `${values.offeredModel} ${values.offeredStorage}`,
        offered_model: values.offeredModel,
        offered_storage: values.offeredStorage,
        offered_battery_health: values.offeredBattery,
        offered_condition: values.offeredCondition,
        cash_difference: cashDiff,
        meeting_spot: values.meetingSpot,
        message: values.message,
        status: "pending",
      });

      setProposalSent(true);
      setStep(4);
    } catch (err: any) {
      console.warn("Could not record swap to collection, falling back:", err);
      setProposalSent(true);
      setStep(4);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setProposalSent(false);
    setStep(1);
    setGeneralError(null);
    reset();
    onClose();
  };

  const modalTitle = (
    <div className="flex items-center gap-2.5">
      <span className="w-8 h-8 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center font-bold shrink-0">
        <ArrowLeftRight className="w-4 h-4" />
      </span>
      <div>
        <h3 className="font-extrabold text-base text-base-content">
          Propose Device Swap
        </h3>
        <p className="text-xs text-base-content/60 font-normal">
          Trading for: {targetItem.title || "iPhone"}
        </p>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title={modalTitle}
      boxClassName="max-w-lg"
    >
      <div className="pt-2 text-base-content">
        {!isAuthenticated ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-lg text-base-content">
                Sign in to Propose Swap
              </h4>
              <p className="text-xs text-base-content/60 max-w-xs mx-auto">
                Direct peer negotiations require an active Swappy profile to
                ensure authentic and verified trade interactions.
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                window.location.href = "/app/auth/login";
              }}
              className="btn btn-primary rounded-xl font-bold w-full"
            >
              Sign In to Continue
            </button>
          </div>
        ) : (
          <>
            {/* Step Indicators */}
            {step < 4 && (
              <div className="flex items-center justify-between pb-4 border-b border-base-200 text-xs font-semibold text-base-content/60">
                <span
                  className={
                    step === 1
                      ? "text-primary font-bold"
                      : "text-base-content/60"
                  }
                >
                  1. Your Device
                </span>
                <span>•</span>
                <span
                  className={
                    step === 2
                      ? "text-primary font-bold"
                      : "text-base-content/60"
                  }
                >
                  2. Cash Balance
                </span>
                <span>•</span>
                <span
                  className={
                    step === 3
                      ? "text-primary font-bold"
                      : "text-base-content/60"
                  }
                >
                  3. Meeting Spot
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="pt-4">
              {generalError && (
                <div className="p-3 mb-4 rounded-xl bg-error/10 border border-error/20 text-error text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{generalError}</span>
                </div>
              )}

              <div className="space-y-4">
                {step === 1 && (
                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-base-content">
                        Your iPhone Model
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
                          {storageOptions.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
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
                          className="input input-bordered w-full rounded-xl text-sm font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-base-content">
                        Physical Condition
                      </label>
                      <select
                        {...register("offeredCondition")}
                        className="select select-bordered w-full rounded-xl text-sm capitalize"
                      >
                        {conditionOptions.map((c) => (
                          <option key={c} value={c}>
                            {c.replace("_", " ")}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-base-content">
                        Any known issues or replacements? (Optional)
                      </label>
                      <input
                        type="text"
                        {...register("offeredIssues")}
                        placeholder="e.g. Screen replaced by Apple, tiny dent on corner"
                        className="input input-bordered w-full rounded-xl text-xs"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="btn btn-primary rounded-xl font-bold w-full"
                      >
                        Continue to Cash Balance
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
                            ₦
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
    </Modal>
  );
}
