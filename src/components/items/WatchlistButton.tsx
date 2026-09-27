import { Heart } from "lucide-react";
import { useState } from "react";
import { useWatchlist } from "../../helpers/watchlist";
import type { ItemCardRecord } from "./ItemCard";

interface WatchlistButtonProps {
  item: ItemCardRecord;
  className?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function WatchlistButton({
  item,
  className = "",
  size = "md",
  showLabel = false,
}: WatchlistButtonProps) {
  const { isSaved, toggleWatchlist } = useWatchlist();
  const saved = isSaved(item.id);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAnimating(true);
    try {
      await toggleWatchlist(item);
    } finally {
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const buttonSizes = {
    sm: "w-7 h-7 min-h-7",
    md: "w-9 h-9 min-h-9",
    lg: "h-11 px-4",
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={saved ? "Remove from watchlist" : "Add to watchlist"}
      title={saved ? "Saved in Watchlist" : "Save to Watchlist"}
      className={`btn btn-circle bg-base-100/90 hover:bg-base-100 border border-base-300/80 shadow-sm backdrop-blur transition-all duration-200 cursor-pointer ${
        buttonSizes[size]
      } ${
        saved
          ? "text-error border-error/30 hover:border-error/50"
          : "text-base-content/60 hover:text-error hover:border-error/30"
      } ${isAnimating ? "scale-125" : "scale-100"} ${className}`}
    >
      <Heart
        className={`${iconSizes[size]} transition-all duration-200 ${
          saved ? "fill-error stroke-error" : "stroke-current"
        }`}
      />
      {showLabel && (
        <span className="text-xs font-bold ml-1.5">
          {saved ? "Saved" : "Save iPhone"}
        </span>
      )}
    </button>
  );
}
