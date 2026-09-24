import { Link } from "@tanstack/react-router";
import { Flame, Sparkles, TrendingUp } from "lucide-react";
import type { CategoryTrendingResponse } from "../../types/categories";

interface TrendingCategoriesBannerProps {
  trendingData: CategoryTrendingResponse | null;
  activeCategory?: string;
  onSelectCategory?: (slug: string) => void;
}

export function TrendingCategoriesBanner({
  trendingData,
  activeCategory = "all",
  onSelectCategory,
}: TrendingCategoriesBannerProps) {
  if (
    !trendingData ||
    !trendingData.trending ||
    trendingData.trending.length === 0
  ) {
    return null;
  }

  const { highlights, trending } = trendingData;

  return (
    <div className="space-y-4">
      {/* Highlight Market Signals if available */}
      {highlights?.most_viewed && (
        <div className="flex items-center gap-2 text-xs sm:text-sm text-base-content/75 flex-wrap">
          <span className="badge badge-primary badge-sm gap-1 font-bold">
            <Flame className="w-3.5 h-3.5" /> Hot Right Now
          </span>
          <span>
            Most viewed device:{" "}
            <Link
              to="/explore"
              search={{ category: highlights.most_viewed.slug }}
              className="font-extrabold text-base-content hover:text-primary transition-colors underline underline-offset-2"
            >
              {highlights.most_viewed.name}
            </Link>{" "}
            ({highlights.most_viewed.total_views} verified views)
          </span>
          {highlights.highest_average_views &&
            highlights.highest_average_views.slug !==
              highlights.most_viewed.slug && (
              <>
                <span className="hidden sm:inline">&bull;</span>
                <span className="hidden sm:inline">
                  Highest engagement:{" "}
                  <strong className="text-base-content">
                    {highlights.highest_average_views.name}
                  </strong>
                </span>
              </>
            )}
        </div>
      )}

      {/* Horizontal Scrollable Trending Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
        <button
          type="button"
          onClick={() => (onSelectCategory ? onSelectCategory("") : undefined)}
          className={`btn btn-sm rounded-2xl font-bold whitespace-nowrap transition-all duration-200 shrink-0 ${
            !activeCategory || activeCategory === "all"
              ? "btn-primary shadow-xs"
              : "btn-ghost bg-base-200/80 hover:bg-base-200 text-base-content/80"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>All iPhones</span>
        </button>

        {trending.map((cat, idx) => {
          const isSelected = activeCategory === cat.slug;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() =>
                onSelectCategory ? onSelectCategory(cat.slug) : undefined
              }
              className={`btn btn-sm rounded-2xl font-bold whitespace-nowrap transition-all duration-200 shrink-0 inline-flex items-center gap-1.5 ${
                isSelected
                  ? "btn-primary shadow-xs"
                  : "btn-ghost bg-base-200/80 hover:bg-base-200 text-base-content/80"
              }`}
            >
              {idx < 3 && (
                <TrendingUp className="w-3.5 h-3.5 text-accent shrink-0" />
              )}
              <span>{cat.name}</span>
              {cat.total_views > 0 && (
                <span className="badge badge-xs bg-base-300/80 text-base-content/70 font-mono">
                  {cat.total_views}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
