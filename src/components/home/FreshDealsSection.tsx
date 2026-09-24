import { Link } from "@tanstack/react-router";
import { ArrowLeftRight, ChevronRight, Flame } from "lucide-react";
import { useState } from "react";
import { ItemGrid } from "../items/ItemGrid";
import type { ItemCardRecord } from "../items/ItemCard";
import { SafetyAlert } from "../common/SafetyAlert";

interface FreshDealsSectionProps {
  listings: ItemCardRecord[];
}

export function FreshDealsSection({ listings }: FreshDealsSectionProps) {
  const [activeTab, setActiveTab] = useState<
    "all" | "swap" | "budget" | "flawless"
  >("all");

  const filteredListings = listings.filter((item) => {
    if (activeTab === "swap") return Boolean(item.accepts_swap);
    if (activeTab === "budget") return (item.price || 0) <= 500000;
    if (activeTab === "flawless") return item.condition === "flawless";
    return true;
  });

  return (
    <section className="py-10 bg-base-100">
      <div className="container mx-auto px-4 space-y-6">
        {/* Section Header with Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-base-200">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary text-primary-content">
              <Flame className="w-5 h-5 stroke-[2.5]" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-base-content">
              Fresh Marketplace Deals
            </h2>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveTab("all")}
              className={`btn btn-xs rounded-lg font-bold transition-all ${
                activeTab === "all"
                  ? "btn-primary shadow-sm"
                  : "btn-ghost bg-base-200 hover:bg-base-300"
              }`}
            >
              All Listings
            </button>
            <button
              onClick={() => setActiveTab("swap")}
              className={`btn btn-xs rounded-lg font-bold transition-all inline-flex items-center gap-1 ${
                activeTab === "swap"
                  ? "btn-secondary text-secondary-content shadow-sm"
                  : "btn-ghost bg-base-200 hover:bg-base-300"
              }`}
            >
              <ArrowLeftRight className="w-3 h-3" />
              Accepts Swap
            </button>
            <button
              onClick={() => setActiveTab("budget")}
              className={`btn btn-xs rounded-lg font-bold transition-all ${
                activeTab === "budget"
                  ? "btn-neutral shadow-sm"
                  : "btn-ghost bg-base-200 hover:bg-base-300"
              }`}
            >
              Under ₦500k
            </button>
            <button
              onClick={() => setActiveTab("flawless")}
              className={`btn btn-xs rounded-lg font-bold transition-all ${
                activeTab === "flawless"
                  ? "btn-info text-info-content shadow-sm"
                  : "btn-ghost bg-base-200 hover:bg-base-300"
              }`}
            >
              Flawless Condition
            </button>
          </div>
        </div>

        {/* Listings Grid */}
        <ItemGrid listings={filteredListings} />

        {/* Explore More CTA */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            to={"/explore" as string}
            className="btn btn-outline border-base-300 hover:bg-base-200 hover:text-base-content rounded-xl font-bold text-sm inline-flex items-center gap-2"
          >
            <span>Open Detailed Filter Catalog</span>
            <ChevronRight className="w-4 h-4" />
          </Link>

          <span className="text-xs text-base-content/60">
            Showing {filteredListings.length} of {listings.length} verified
            listings
          </span>
        </div>

        {/* Safety Alert Banner */}
        <div className="pt-4">
          <SafetyAlert />
        </div>
      </div>
    </section>
  );
}
