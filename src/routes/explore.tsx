import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BatteryCharging, Filter, Sparkles } from "lucide-react";
import { useState } from "react";
import { ItemGrid } from "../components/items/ItemGrid";
import { Footer } from "../components/layout/Footer";
import { PublicNavbar } from "../components/layout/PublicNavbar";
import SearchBar from "../components/SearchBar";
import { TrendingCategoriesBanner } from "../components/catalog/TrendingCategoriesBanner";
import {
  getCatalogItemsFn,
  getCategoriesFn,
  getTrendingCategoriesFn,
} from "../server/listings";

interface ExploreSearchParams {
  category?: string;
  model?: string;
  storage?: string;
  condition?: string;
  carrier?: string;
  minBattery?: number;
  acceptsSwap?: boolean;
  search?: string;
  q?: string;
  sort?: string;
}

export const Route = createFileRoute("/explore")({
  validateSearch: (search: Record<string, unknown>): ExploreSearchParams => {
    return {
      category: search.category ? String(search.category) : undefined,
      model: search.model ? String(search.model) : undefined,
      storage: search.storage ? String(search.storage) : undefined,
      condition: search.condition ? String(search.condition) : undefined,
      carrier: search.carrier ? String(search.carrier) : undefined,
      minBattery: search.minBattery ? Number(search.minBattery) : undefined,
      acceptsSwap: search.acceptsSwap === true || search.acceptsSwap === "true",
      search: search.search
        ? String(search.search)
        : search.q
          ? String(search.q)
          : undefined,
      q: search.q ? String(search.q) : undefined,
      sort: search.sort ? String(search.sort) : "newest",
    };
  },
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const [catalogResult, trendingResult, categoriesList] = await Promise.all([
      getCatalogItemsFn({
        data: {
          category: deps.category,
          model: deps.model,
          storage: deps.storage,
          condition: deps.condition,
          carrier: deps.carrier,
          minBattery: deps.minBattery,
          acceptsSwap: deps.acceptsSwap,
          search: deps.search || deps.q,
          sort: deps.sort,
        },
      }),
      getTrendingCategoriesFn(),
      getCategoriesFn(),
    ]);

    return {
      items: catalogResult.items,
      totalCount: catalogResult.totalCount,
      trendingData: trendingResult,
      categories: categoriesList,
    };
  },
  component: ExplorePage,
});

function ExplorePage() {
  const { items, totalCount, trendingData } = Route.useLoaderData();
  const searchParams = Route.useSearch();
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);

  const activeCategory = searchParams.category || "all";
  const activeSort = searchParams.sort || "newest";
  const activeStorage = searchParams.storage || "";
  const activeCondition = searchParams.condition || "";
  const activeMinBattery = searchParams.minBattery || 0;
  const acceptsSwap = Boolean(searchParams.acceptsSwap);

  const handleSelectCategory = (catSlug: string) => {
    navigate({
      to: "/explore",
      search: (prev) => ({
        ...prev,
        category: catSlug || undefined,
      }),
    });
  };

  const handleSortChange = (newSort: string) => {
    navigate({
      to: "/explore",
      search: (prev) => ({
        ...prev,
        sort: newSort,
      }),
    });
  };

  const handleStorageToggle = (size: string) => {
    navigate({
      to: "/explore",
      search: (prev) => ({
        ...prev,
        storage: prev.storage === size ? undefined : size,
      }),
    });
  };

  const handleConditionToggle = (cond: string) => {
    navigate({
      to: "/explore",
      search: (prev) => ({
        ...prev,
        condition: prev.condition === cond ? undefined : cond,
      }),
    });
  };

  const handleBatteryChange = (val: number) => {
    navigate({
      to: "/explore",
      search: (prev) => ({
        ...prev,
        minBattery: val > 0 ? val : undefined,
      }),
    });
  };

  const handleSwapToggle = () => {
    navigate({
      to: "/explore",
      search: (prev) => ({
        ...prev,
        acceptsSwap: prev.acceptsSwap ? undefined : true,
      }),
    });
  };

  const handleClearFilters = () => {
    navigate({
      to: "/explore",
      search: () => ({}),
    });
  };

  const hasActiveFilters = Boolean(
    searchParams.category ||
    searchParams.storage ||
    searchParams.condition ||
    searchParams.carrier ||
    searchParams.minBattery ||
    searchParams.acceptsSwap ||
    searchParams.search ||
    searchParams.q,
  );

  return (
    <div className="min-h-screen bg-base-100 text-base-content flex flex-col antialiased">
      <PublicNavbar />

      <main className="flex-1 container mx-auto px-4 py-6 md:py-8 space-y-6">
        {/* Header with Search and Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-base-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-base-content flex items-center gap-2.5">
              <span>iPhone Marketplace</span>
              <span className="badge badge-primary badge-sm font-mono font-bold">
                {totalCount} devices
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-base-content/70 mt-1">
              Browse verified iPhones across Nigeria with live battery health,
              condition transparency, and swap options.
            </p>
          </div>

          <div className="w-full md:w-80">
            <SearchBar placeholder="Search models, color..." />
          </div>
        </div>

        {/* Real-time Trending iPhone Categories */}
        <TrendingCategoriesBanner
          trendingData={trendingData}
          activeCategory={activeCategory}
          onSelectCategory={handleSelectCategory}
        />

        {/* Filter Bar Controls */}
        <div className="space-y-3 bg-base-200/50 p-3.5 sm:p-4 rounded-2xl border border-base-300">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Quick Storage Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-bold uppercase tracking-wider text-base-content/60 mr-1 hidden sm:inline">
                Storage:
              </span>
              {["64GB", "128GB", "256GB", "512GB", "1TB"].map((cap) => (
                <button
                  key={cap}
                  onClick={() => handleStorageToggle(cap)}
                  className={`btn btn-xs rounded-xl font-bold ${
                    activeStorage === cap
                      ? "btn-primary shadow-xs"
                      : "btn-ghost bg-base-100 border border-base-300 text-base-content/75"
                  }`}
                >
                  {cap}
                </button>
              ))}

              <button
                onClick={handleSwapToggle}
                className={`btn btn-xs rounded-xl font-bold ml-1 ${
                  acceptsSwap
                    ? "btn-secondary shadow-xs"
                    : "btn-ghost bg-base-100 border border-base-300 text-base-content/75"
                }`}
              >
                Swap OK
              </button>
            </div>

            {/* Toggle Multi-facet Drawer & Sort Selector */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`btn btn-xs rounded-xl font-bold inline-flex items-center gap-1 ${
                  showFilters || activeCondition || activeMinBattery > 0
                    ? "btn-accent text-accent-content"
                    : "btn-ghost bg-base-100 border border-base-300 text-base-content/75"
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>
                  Filters{" "}
                  {activeMinBattery > 0 || activeCondition ? "(Active)" : ""}
                </span>
              </button>

              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="btn btn-ghost btn-xs text-error font-bold"
                >
                  Clear
                </button>
              )}

              <select
                value={activeSort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="select select-bordered select-xs rounded-xl text-xs bg-base-100 font-bold"
              >
                <option value="newest">Newest First</option>
                <option value="promoted">Promoted First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Expandable Advanced Filter Panel: Battery & Cosmetic Grade */}
          {showFilters && (
            <div className="pt-3 border-t border-base-300/60 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-150">
              {/* Battery Health Threshold Slider */}
              <div className="bg-base-100 p-3.5 rounded-xl border border-base-300 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-base-content">
                  <span className="flex items-center gap-1.5">
                    <BatteryCharging className="w-4 h-4 text-primary" />
                    <span>Minimum Battery Health</span>
                  </span>
                  <span className="badge badge-sm badge-neutral font-mono font-bold">
                    {activeMinBattery > 0 ? `${activeMinBattery}%+` : "Any"}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="95"
                  step="5"
                  value={activeMinBattery}
                  onChange={(e) => handleBatteryChange(Number(e.target.value))}
                  className="range range-xs range-primary"
                />
                <div className="flex justify-between text-[10px] text-base-content/50 font-mono">
                  <span>Any</span>
                  <span>75%</span>
                  <span>80%</span>
                  <span>85%</span>
                  <span>90%+</span>
                </div>
              </div>

              {/* Cosmetic Condition Selector */}
              <div className="bg-base-100 p-3.5 rounded-xl border border-base-300 space-y-2">
                <div className="text-xs font-bold text-base-content">
                  Cosmetic Grade
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "All Grades", val: "" },
                    { label: "Flawless", val: "flawless" },
                    { label: "Open Box", val: "open_box" },
                    { label: "Good", val: "good" },
                    { label: "Fair", val: "fair" },
                  ].map((c) => (
                    <button
                      key={c.val}
                      type="button"
                      onClick={() => handleConditionToggle(c.val)}
                      className={`btn btn-xs rounded-lg font-bold ${
                        activeCondition === c.val
                          ? "btn-primary"
                          : "btn-ghost border border-base-300 text-base-content/70"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Items Grid or Empty State */}
        {items && items.length > 0 ? (
          <div className="pt-2">
            <ItemGrid listings={items} />
          </div>
        ) : (
          <div className="bg-base-200/50 rounded-3xl border border-base-300 p-12 text-center space-y-4 shadow-xs my-6">
            <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-lg text-base-content">
                No matching iPhone listings found
              </h3>
              <p className="text-xs sm:text-sm text-base-content/60 max-w-sm mx-auto">
                Try loosening your filter criteria or search query to find
                available devices.
              </p>
            </div>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="btn btn-primary rounded-2xl font-bold text-xs sm:text-sm px-6 shadow-sm"
              >
                Reset All Filters
              </button>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
