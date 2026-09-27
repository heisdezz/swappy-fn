import { MessageSquare, ShieldCheck, Sparkles, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { ReviewModal } from "./ReviewModal";
import type { ReviewRecord, ReviewSummary } from "../../helpers/reviews";

interface ReviewListProps {
  sellerId: string;
  sellerName?: string;
  itemId?: string;
  itemTitle?: string;
  reviews: ReviewRecord[];
  summary: ReviewSummary;
  isLoading?: boolean;
}

export function ReviewList({
  sellerId,
  sellerName = "Verified Seller",
  itemId,
  itemTitle,
  reviews,
  summary,
  isLoading,
}: ReviewListProps) {
  const [selectedStarFilter, setSelectedStarFilter] = useState<number | null>(
    null,
  );
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);

  const filteredReviews = useMemo(() => {
    if (!selectedStarFilter) return reviews;
    return reviews.filter((r) => r.rating === selectedStarFilter);
  }, [reviews, selectedStarFilter]);

  if (isLoading) {
    return (
      <div className="p-8 text-center bg-base-100 rounded-3xl border border-base-200">
        <span className="loading loading-spinner text-primary loading-md" />
        <p className="text-xs text-base-content/60 mt-2 font-medium">
          Loading merchant reputation & reviews...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Score & Distribution Card */}
      <div className="bg-base-100 rounded-3xl border border-base-300 p-6 sm:p-7 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Big Score Column (4 cols) */}
          <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-base-200 space-y-2">
            <div className="text-4xl sm:text-5xl font-black text-base-content tracking-tight">
              {summary.average.toFixed(1)}
            </div>

            <div className="flex items-center gap-1 text-warning">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    s <= Math.round(summary.average)
                      ? "fill-warning stroke-warning"
                      : "text-base-300 fill-base-200"
                  }`}
                />
              ))}
            </div>

            <div className="text-xs font-semibold text-base-content/60">
              Based on {summary.total} verified{" "}
              {summary.total === 1 ? "review" : "reviews"}
            </div>

            <button
              type="button"
              onClick={() => setIsWriteModalOpen(true)}
              className="btn btn-primary btn-sm rounded-xl font-bold mt-2 text-xs shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Write a Review</span>
            </button>
          </div>

          {/* Star Distribution Breakdown (8 cols) */}
          <div className="md:col-span-8 space-y-2 px-2 sm:px-4">
            {([5, 4, 3, 2, 1] as const).map((stars) => {
              const count = summary.breakdown[stars] || 0;
              const pct =
                summary.total > 0
                  ? Math.round((count / summary.total) * 100)
                  : 0;
              const isSelected = selectedStarFilter === stars;

              return (
                <button
                  key={stars}
                  type="button"
                  onClick={() =>
                    setSelectedStarFilter(isSelected ? null : stars)
                  }
                  className={`w-full flex items-center gap-3 text-xs p-1 rounded-xl transition-colors cursor-pointer text-left ${
                    isSelected
                      ? "bg-base-200 font-bold"
                      : "hover:bg-base-200/50"
                  }`}
                >
                  <span className="w-12 flex items-center gap-1 font-semibold text-base-content/75 shrink-0">
                    <span>{stars}</span>
                    <Star className="w-3 h-3 fill-warning text-warning" />
                  </span>

                  <div className="flex-1 h-2.5 bg-base-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-warning rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <span className="w-10 text-right text-base-content/60 font-mono text-[11px] shrink-0">
                    {pct}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter Chips if any reviews */}
      {reviews.length > 0 && (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-base-content/60 mr-1">
              Filter:
            </span>
            <button
              type="button"
              onClick={() => setSelectedStarFilter(null)}
              className={`btn btn-xs rounded-lg text-[11px] font-bold ${
                selectedStarFilter === null
                  ? "btn-neutral"
                  : "btn-ghost bg-base-200/60"
              }`}
            >
              All ({reviews.length})
            </button>
            {([5, 4, 3, 2, 1] as const).map((stars) => {
              const count = summary.breakdown[stars] || 0;
              if (count === 0 && selectedStarFilter !== stars) return null;
              return (
                <button
                  key={stars}
                  type="button"
                  onClick={() =>
                    setSelectedStarFilter(
                      selectedStarFilter === stars ? null : stars,
                    )
                  }
                  className={`btn btn-xs rounded-lg text-[11px] font-bold ${
                    selectedStarFilter === stars
                      ? "btn-primary"
                      : "btn-ghost bg-base-200/60"
                  }`}
                >
                  {stars} ★ ({count})
                </button>
              );
            })}
          </div>

          {selectedStarFilter && (
            <button
              type="button"
              onClick={() => setSelectedStarFilter(null)}
              className="text-xs font-bold text-primary hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>
      )}

      {/* Review Cards List */}
      {filteredReviews.length === 0 ? (
        <div className="text-center py-12 bg-base-100 rounded-3xl border border-dashed border-base-300 p-6 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-base-200 text-base-content/40 flex items-center justify-center mx-auto">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-base-content">
              {reviews.length === 0
                ? "No reviews yet for this dealer"
                : "No reviews match the selected star rating"}
            </h4>
            <p className="text-xs text-base-content/60 max-w-sm mx-auto">
              {reviews.length === 0
                ? "Be the first buyer to share your inspection and trade-in experience with the community."
                : "Try selecting another star rating or reset filters."}
            </p>
          </div>
          {reviews.length === 0 && (
            <button
              type="button"
              onClick={() => setIsWriteModalOpen(true)}
              className="btn btn-outline btn-primary btn-sm rounded-xl font-bold text-xs"
            >
              Leave First Review
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReviews.map((review) => {
            const author = review.expand?.author;
            const authorName = author?.name || "Verified Buyer";
            const initials = authorName.slice(0, 2).toUpperCase();
            const dateStr = review.created
              ? new Date(review.created).toLocaleDateString("en-NG", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Recently";

            return (
              <div
                key={review.id}
                className="p-5 rounded-2xl bg-base-100 border border-base-200/80 shadow-xs space-y-3"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                      {initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-base-content">
                          {authorName}
                        </span>
                        <span className="badge badge-success/15 text-success badge-xs font-bold gap-1 text-[10px]">
                          <ShieldCheck className="w-3 h-3" />
                          Verified
                        </span>
                      </div>
                      <div className="text-[10px] text-base-content/50">
                        {dateStr}
                      </div>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-0.5 text-warning">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= review.rating
                            ? "fill-warning stroke-warning"
                            : "text-base-300 fill-base-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Comment Content */}
                <p className="text-xs text-base-content/80 leading-relaxed">
                  {review.comment}
                </p>

                {/* Reviewed Item Badge if available */}
                {review.expand?.item && (
                  <div className="pt-1 text-[11px] font-semibold text-primary">
                    Verified Deal: {review.expand.item.title || "iPhone"}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Review Submission Modal */}
      <ReviewModal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        sellerId={sellerId}
        sellerName={sellerName}
        itemId={itemId}
        itemTitle={itemTitle}
      />
    </div>
  );
}
