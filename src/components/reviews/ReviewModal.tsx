import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { useState } from "react";
import { pb } from "../../client/pb";
import { useSubmitReview } from "../../helpers/reviews";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerId: string;
  sellerName?: string;
  itemId?: string;
  itemTitle?: string;
}

const QUICK_TAGS = [
  "Accurate Battery Health",
  "Face ID Works Perfectly",
  "Flawless Screen Condition",
  "Smooth Trade-In Process",
  "Honest & Transparent Dealer",
  "Fast WhatsApp Response",
];

export function ReviewModal({
  isOpen,
  onClose,
  sellerId,
  sellerName = "Seller",
  itemId,
  itemTitle,
}: ReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const submitMutation = useSubmitReview();
  const isAuthenticated = pb.authStore.isValid;

  if (!isOpen) return null;

  const handleQuickTagClick = (tag: string) => {
    if (!comment) {
      setComment(tag + ".");
    } else if (!comment.includes(tag)) {
      setComment((prev) => `${prev} ${tag}.`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!isAuthenticated) {
      setErrorMessage("Please sign in to leave an authentic buyer review.");
      return;
    }

    if (rating < 1 || rating > 5) {
      setErrorMessage("Please select a star rating from 1 to 5.");
      return;
    }

    if (!comment.trim() || comment.trim().length < 8) {
      setErrorMessage(
        "Please share at least 8 characters about your trade or inspection.",
      );
      return;
    }

    try {
      await submitMutation.mutateAsync({
        target_user: sellerId,
        rating,
        comment: comment.trim(),
        item: itemId,
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setComment("");
        setRating(5);
        onClose();
      }, 1800);
    } catch (err: any) {
      setErrorMessage(
        err?.message || "Failed to submit review. Please try again.",
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs antialiased">
      <div className="relative w-full max-w-lg bg-base-100 rounded-3xl shadow-2xl border border-base-300 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-base-200 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-warning/15 text-warning">
                <Star className="w-4 h-4 fill-warning" />
              </span>
              <h3 className="text-lg font-black text-base-content tracking-tight">
                Rate & Review Dealer
              </h3>
            </div>
            <p className="text-xs text-base-content/65">
              Reviewing{" "}
              <span className="font-bold text-base-content">{sellerName}</span>
              {itemTitle ? ` for ${itemTitle}` : ""}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-circle btn-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {!isAuthenticated ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-base-content">
                Sign in to Leave a Verified Review
              </h4>
              <p className="text-xs text-base-content/65 max-w-xs mx-auto">
                To prevent artificial review bombing, only verified Swappy
                accounts can review dealers and device swaps.
              </p>
              <div className="pt-2">
                <Link
                  to="/app/auth/login"
                  className="btn btn-primary btn-sm rounded-xl font-bold px-6 text-xs"
                >
                  Sign In Now
                </Link>
              </div>
            </div>
          ) : isSuccess ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-14 h-14 rounded-full bg-success/15 text-success flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-black text-lg text-base-content">
                Review Published!
              </h4>
              <p className="text-xs text-base-content/70 max-w-xs mx-auto">
                Thank you for contributing to Nigerian secondhand iPhone
                transparency.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-error/10 border border-error/20 text-error text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Star Rating Selector */}
              <div className="space-y-2 text-center py-2 bg-base-200/40 rounded-2xl border border-base-300/60 p-4">
                <label className="text-xs font-bold text-base-content/70 uppercase tracking-wider block">
                  Tap to rate your experience
                </label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((starValue) => {
                    const active = (hoverRating || rating) >= starValue;
                    return (
                      <button
                        key={starValue}
                        type="button"
                        onMouseEnter={() => setHoverRating(starValue)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(starValue)}
                        className="p-1 text-2xl transition-transform hover:scale-125 focus:outline-hidden cursor-pointer"
                      >
                        <Star
                          className={`w-7 h-7 sm:w-8 sm:h-8 ${
                            active
                              ? "fill-warning text-warning"
                              : "text-base-300 fill-base-200"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <div className="text-xs font-bold text-base-content">
                  {hoverRating || rating === 5
                    ? "5 Stars - Outstanding & Reliable"
                    : (hoverRating || rating) === 4
                      ? "4 Stars - Great Experience"
                      : (hoverRating || rating) === 3
                        ? "3 Stars - Average Inspection"
                        : (hoverRating || rating) === 2
                          ? "2 Stars - Some Discrepancies"
                          : "1 Star - Poor Experience"}
                </div>
              </div>

              {/* Quick Tags */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-base-content/70">
                  Quick Feedback Highlights
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleQuickTagClick(tag)}
                      className="btn btn-xs rounded-lg font-semibold bg-base-200/80 text-base-content/80 hover:bg-primary hover:text-primary-content border-none text-[11px]"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Written Review */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-base-content/80 flex items-center justify-between">
                  <span>Detailed Buyer Review</span>
                  <span className="text-[10px] text-base-content/50 font-normal">
                    Min. 8 characters
                  </span>
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details regarding device condition, battery percentage matching, True Tone testing, and whether the seller was professional during pickup..."
                  rows={4}
                  className="textarea textarea-bordered rounded-2xl w-full text-xs bg-base-100 resize-none leading-relaxed"
                  required
                />
              </div>

              {/* Disclaimer */}
              <div className="p-3 rounded-xl bg-base-200/50 text-[11px] text-base-content/60 leading-normal flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-success shrink-0 mt-0.5" />
                <span>
                  Your review will be attributed to your verified account and
                  helps other Nigerians make safe phone decisions.
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-ghost btn-sm rounded-xl font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="btn btn-primary btn-sm rounded-xl font-bold px-5 text-xs shadow-sm inline-flex items-center gap-1.5"
                >
                  {submitMutation.isPending ? (
                    <>
                      <span className="loading loading-spinner loading-xs" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Submit Review</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
