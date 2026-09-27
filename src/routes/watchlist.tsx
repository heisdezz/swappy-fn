import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BellRing,
  Compass,
  Heart,
  Search,
  Smartphone,
  TrendingDown,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Footer } from "../components/layout/Footer";
import { PublicNavbar } from "../components/layout/PublicNavbar";
import { ItemCard } from "../components/items/ItemCard";
import { useWatchlist } from "../helpers/watchlist";

export const Route = createFileRoute("/watchlist")({
  ssr: false,
  component: WatchlistPage,
});

function WatchlistPage() {
  const { watchlist, count } = useWatchlist();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStorage, setSelectedStorage] = useState("all");
  const [sortBy, setSortBy] = useState<"recent" | "price-asc" | "price-desc">(
    "recent",
  );

  const filteredItems = useMemo(() => {
    let result = [...watchlist];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (i) =>
          (i.title && i.title.toLowerCase().includes(q)) ||
          (i.model && i.model.toLowerCase().includes(q)) ||
          (i.color && i.color.toLowerCase().includes(q)) ||
          (i.location_city && i.location_city.toLowerCase().includes(q)),
      );
    }

    if (selectedStorage !== "all") {
      result = result.filter((i) => i.storage === selectedStorage);
    }

    if (sortBy === "price-asc") {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    return result;
  }, [watchlist, searchQuery, selectedStorage, sortBy]);

  return (
    <div className="min-h-screen bg-base-100 text-base-content flex flex-col antialiased">
      <PublicNavbar />

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-base-200">
          <div className="space-y-1">
            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-base-content/65 hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Continue Exploring Catalog</span>
            </Link>

            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-error/15 text-error flex items-center justify-center font-black shadow-xs">
                <Heart className="w-5 h-5 fill-error" />
              </span>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-base-content tracking-tight">
                  Saved iPhones
                </h1>
                <span className="badge badge-error text-error-content badge-md font-bold">
                  {count}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-base-content/70">
              Track your favorite iPhones, compare diagnostic specs, and monitor
              price drops.
            </p>
          </div>

          {/* Price Alerts Active Badge */}
          <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
            <BellRing className="w-4 h-4 shrink-0 animate-bounce" />
            <div className="text-xs font-bold">
              Price Drop Alerts Active
              <div className="text-[10px] opacity-80 font-normal">
                Sellers notified of high buyer interest
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        {count === 0 ? (
          <div className="text-center py-20 px-4 max-w-md mx-auto space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-error/10 text-error flex items-center justify-center mx-auto shadow-xs">
              <Heart className="w-10 h-10 stroke-[1.5]" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-black text-base-content tracking-tight">
                Your Watchlist is Empty
              </h2>
              <p className="text-xs sm:text-sm text-base-content/65">
                Bookmark verified iPhones while exploring to easily compare
                battery conditions, negotiate trade-ins, and receive instant
                price drop notifications.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/explore"
                className="btn btn-primary rounded-2xl font-black px-6 text-sm shadow-md inline-flex items-center gap-2"
              >
                <Compass className="w-4 h-4" />
                <span>Explore iPhone Marketplace</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-base-200/50 rounded-2xl border border-base-300">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/50" />
                <input
                  type="text"
                  placeholder="Filter saved by model, color..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input input-sm rounded-xl pl-9 bg-base-100 w-full text-xs"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
                {/* Storage filter */}
                <div className="flex items-center gap-1">
                  {["all", "128GB", "256GB", "512GB"].map((storage) => (
                    <button
                      key={storage}
                      type="button"
                      onClick={() => setSelectedStorage(storage)}
                      className={`btn btn-xs rounded-lg text-[10px] font-bold ${
                        selectedStorage === storage
                          ? "btn-primary"
                          : "btn-ghost bg-base-100 text-base-content/70"
                      }`}
                    >
                      {storage === "all" ? "All Sizes" : storage}
                    </button>
                  ))}
                </div>

                {/* Sort selector */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="select select-sm select-bordered rounded-xl text-xs bg-base-100 font-semibold"
                >
                  <option value="recent">Recently Saved</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Price Drop Highlight Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-success/15 via-success/5 to-transparent border border-success/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-success text-success-content font-black">
                  <TrendingDown className="w-4 h-4" />
                </span>
                <div>
                  <div className="text-xs sm:text-sm font-black text-base-content">
                    Smart Market Price Tracker
                  </div>
                  <div className="text-[11px] text-base-content/70">
                    We automatically scan Computer Village & Banex daily to flag
                    price discounts on your saved items.
                  </div>
                </div>
              </div>
              <span className="badge badge-success badge-sm font-bold hidden sm:inline-flex">
                Auto-Alerts On
              </span>
            </div>

            {/* Saved Items Grid */}
            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-base-200/40 rounded-3xl border border-dashed border-base-300 space-y-2">
                <Smartphone className="w-8 h-8 text-base-content/40 mx-auto" />
                <h3 className="font-bold text-sm text-base-content">
                  No saved items match your filter
                </h3>
                <p className="text-xs text-base-content/60">
                  Try clearing your search query or storage filter.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedStorage("all");
                  }}
                  className="btn btn-ghost btn-xs text-primary font-bold"
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
