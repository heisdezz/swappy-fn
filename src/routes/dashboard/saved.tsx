import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Compass, Heart, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { ItemCard } from "../../components/items/ItemCard";
import { useWatchlist } from "../../helpers/watchlist";

export const Route = createFileRoute("/dashboard/saved")({
  ssr: false,
  component: DashboardSavedPage,
});

function DashboardSavedPage() {
  const { watchlist, count } = useWatchlist();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStorage, setSelectedStorage] = useState("all");

  const filteredItems = useMemo(() => {
    let result = [...watchlist];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (i) =>
          (i.title && i.title.toLowerCase().includes(q)) ||
          (i.model && i.model.toLowerCase().includes(q)) ||
          (i.color && i.color.toLowerCase().includes(q)),
      );
    }

    if (selectedStorage !== "all") {
      result = result.filter((i) => i.storage === selectedStorage);
    }

    return result;
  }, [watchlist, searchQuery, selectedStorage]);

  return (
    <DashboardLayout activeTab="saved">
      <div className="space-y-6 w-full">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-base-200">
          <div className="space-y-1">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-base-content/65 hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Overview</span>
            </Link>

            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-2xl bg-error/15 text-error flex items-center justify-center font-black shadow-xs">
                <Heart className="w-5 h-5 fill-error" />
              </span>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-base-content tracking-tight">
                  Saved iPhones & Watchlist
                </h1>
                <span className="badge badge-error text-error-content badge-sm font-bold">
                  {count}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-base-content/70">
              Your personal shortlist of candidate devices for trade-in, swap,
              or direct purchase.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/explore"
              className="btn btn-primary btn-sm rounded-xl font-black text-xs inline-flex items-center gap-1.5 shadow-sm"
            >
              <Compass className="w-4 h-4" />
              <span>Explore More iPhones</span>
            </Link>
          </div>
        </div>

        {/* Content Body */}
        {count === 0 ? (
          <div className="text-center py-20 px-4 max-w-md mx-auto space-y-4 bg-base-100 rounded-3xl border border-base-300">
            <div className="w-16 h-16 rounded-3xl bg-error/10 text-error flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg sm:text-xl font-black text-base-content">
                No Saved iPhones Yet
              </h2>
              <p className="text-xs text-base-content/65">
                Browse our live inventory and click the heart icon on any
                listing to track prices and compare diagnostics here.
              </p>
            </div>
            <Link
              to="/explore"
              className="btn btn-primary btn-sm rounded-xl font-bold px-5 text-xs shadow-sm"
            >
              Find an iPhone
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Filter bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-base-100 rounded-2xl border border-base-300 shadow-xs">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/50" />
                <input
                  type="text"
                  placeholder="Search saved iPhones..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input input-sm rounded-xl pl-9 bg-base-200/50 w-full text-xs"
                />
              </div>

              <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                {["all", "128GB", "256GB", "512GB"].map((storage) => (
                  <button
                    key={storage}
                    type="button"
                    onClick={() => setSelectedStorage(storage)}
                    className={`btn btn-xs rounded-lg text-[10px] font-bold ${
                      selectedStorage === storage
                        ? "btn-primary"
                        : "btn-ghost bg-base-200/70 text-base-content/70"
                    }`}
                  >
                    {storage === "all" ? "All Sizes" : storage}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
