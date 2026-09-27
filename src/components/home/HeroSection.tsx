import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  CheckCircle2,
  Flame,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useState } from "react";
import SearchBar from "../SearchBar";
import type { CategoryTrendingResponse } from "../../types/categories";

interface HeroSectionProps {
  trendingCategories?: CategoryTrendingResponse | null;
}

export function HeroSection({ trendingCategories }: HeroSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const navigate = useNavigate();

  const handleCategorySelect = (slug: string) => {
    setSelectedCategory(slug);
    navigate({
      to: "/explore" as string,
      search: (prev: any) => ({
        ...prev,
        category: slug && slug !== "all" ? slug : undefined,
      }),
    });
  };

  const trendingList = trendingCategories?.trending?.slice(0, 6) || [];
  const mostViewed = trendingCategories?.highlights?.most_viewed;

  return (
    <section className="relative overflow-hidden bg-base-100 py-12 md:py-18 lg:py-20 border-b border-base-200 xl:h-[720px] items-center flex">
      {/* Background Subtle Warm Ambient Glow */}
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Text, Search, Trending Filters */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="space-y-4">
              {mostViewed && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
                  <Flame className="w-3.5 h-3.5 fill-primary text-primary" />
                  <span>
                    Trending #1: {mostViewed.name} with {mostViewed.total_views}{" "}
                    views
                  </span>
                </div>
              )}

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-base-content leading-tight">
                Upgrade Your iPhone{" "}
                <span className="inline-block bg-primary text-primary-content px-3.5 py-1 rounded-2xl shadow-sm">
                  Anytime, Anywhere
                </span>
              </h1>

              <p className="text-base sm:text-lg text-base-content/80 max-w-xl leading-relaxed">
                The specialized peer-to-peer iPhone marketplace for Nigeria.
                Inspect battery health, discover verified pre-owned devices, and
                negotiate direct swaps with cash adjustments.
              </p>
            </div>

            <div className="w-full max-w-xl">
              <SearchBar />
            </div>

            {/* Live Trending Model Pills */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-base-content/65">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span>Trending iPhone Models</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleCategorySelect("all")}
                  className={`btn btn-sm rounded-xl font-bold transition-all text-xs sm:text-sm ${
                    selectedCategory === "all"
                      ? "btn-primary shadow-xs"
                      : "btn-ghost bg-base-200/80 hover:bg-base-200 text-base-content/80"
                  }`}
                >
                  All Models
                </button>

                {trendingList.length > 0
                  ? trendingList.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategorySelect(cat.slug)}
                        className={`btn btn-sm rounded-xl font-bold transition-all text-xs sm:text-sm inline-flex items-center gap-1.5 ${
                          selectedCategory === cat.slug
                            ? "btn-primary shadow-xs"
                            : "btn-ghost bg-base-200/80 hover:bg-base-200 text-base-content/80"
                        }`}
                      >
                        <span>{cat.name}</span>
                        {cat.total_views > 0 && (
                          <span className="badge badge-xs bg-base-300 text-base-content/70 font-mono">
                            {cat.total_views}
                          </span>
                        )}
                      </button>
                    ))
                  : [
                      "iPhone 16 Pro",
                      "iPhone 15 Pro Max",
                      "iPhone 14 Pro Max",
                      "iPhone 13",
                      "iPhone 12",
                    ].map((model) => (
                      <button
                        key={model}
                        type="button"
                        onClick={() =>
                          handleCategorySelect(
                            model.toLowerCase().replace(/\s+/g, "-"),
                          )
                        }
                        className="btn btn-sm btn-ghost bg-base-200/80 hover:bg-base-200 text-base-content/80 rounded-xl font-bold text-xs sm:text-sm"
                      >
                        {model}
                      </button>
                    ))}
              </div>
            </div>

            {/* Trust Highlights */}
            <div className="grid grid-cols-3 gap-3.5 pt-6 border-t border-base-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-primary/10 text-primary shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-sm sm:text-base text-base-content">
                    Tested Phones
                  </div>
                  <div className="text-xs sm:text-sm text-base-content/65">
                    Battery and Face ID verified
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-secondary/10 text-secondary shrink-0">
                  <ArrowLeftRight className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-sm sm:text-base text-base-content">
                    Cash + Device Swaps
                  </div>
                  <div className="text-xs sm:text-sm text-base-content/65">
                    Upgrade or downgrade easily
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-accent/10 text-accent shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-sm sm:text-base text-base-content">
                    Direct Contact
                  </div>
                  <div className="text-xs sm:text-sm text-base-content/65">
                    WhatsApp or call verified sellers
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Multi-Card Stacked Visual Showcase */}
          <div className="lg:col-span-5 relative hidden lg:block select-none py-6">
            {/* Ambient Background Glow */}
            <div className="absolute -inset-6 bg-linear-to-tr from-primary/20 via-accent/15 to-secondary/20 rounded-full blur-3xl opacity-80 pointer-events-none" />

            <div className="group relative mx-auto w-full max-w-[340px] xl:max-w-[370px] aspect-4/5">
              {/* Card 1: Back-Left Layer (Peeking with negative rotation & distinct left offset) */}
              <div
                onClick={() => handleCategorySelect("iphone-13")}
                className="absolute inset-0 rounded-3xl bg-base-200/95 border border-base-300 shadow-xl p-5 flex flex-col justify-between overflow-hidden cursor-pointer transform -rotate-8 -translate-x-12 -translate-y-5 group-hover:-rotate-12 group-hover:-translate-x-20 group-hover:-translate-y-8 hover:z-30 hover:scale-105 hover:shadow-2xl transition-all duration-500 ease-out z-0"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-base-content/50">
                      Pre-owned Deal
                    </span>
                    <div className="text-xs font-black text-base-content">
                      iPhone 13 &bull; 128GB
                    </div>
                  </div>
                  <span className="badge badge-xs bg-success/20 text-success font-mono font-bold">
                    89% Battery
                  </span>
                </div>

                <div className="relative flex-1 flex items-center justify-center my-2 opacity-90">
                  <img
                    src="/iphone_13.png"
                    alt="iPhone 13 Midnight"
                    className="max-h-48 object-contain drop-shadow-md"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-base-300/60 text-xs">
                  <span className="font-mono font-black text-base-content/90">
                    ₦430,000
                  </span>
                  <span className="text-[10px] font-bold text-success flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Clean &bull; Unlocked
                  </span>
                </div>
              </div>

              {/* Card 2: Back-Right Layer (Peeking with positive rotation & distinct right offset) */}
              <div
                onClick={() => handleCategorySelect("iphone-14-pro")}
                className="absolute inset-0 rounded-3xl bg-linear-to-bl from-secondary/15 via-base-200 to-base-100 border border-base-300 shadow-xl p-5 flex flex-col justify-between overflow-hidden cursor-pointer transform rotate-7 translate-x-12 -translate-y-3 group-hover:rotate-12 group-hover:translate-x-20 group-hover:-translate-y-6 hover:z-30 hover:scale-105 hover:shadow-2xl transition-all duration-500 ease-out z-10"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-secondary">
                      Trade-in Offer
                    </span>
                    <div className="text-xs font-black text-base-content">
                      iPhone 14 Pro &bull; 256GB
                    </div>
                  </div>
                  <span className="badge badge-xs badge-secondary font-mono font-bold">
                    94% Battery
                  </span>
                </div>

                <div className="relative flex-1 flex items-center justify-center my-2 opacity-95">
                  <img
                    src="/iphone_8_x_7.png"
                    alt="iPhone 14 Pro"
                    className="max-h-48 object-contain drop-shadow-lg"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-base-300/60 text-xs">
                  <span className="font-mono font-black text-primary">
                    ₦780,000
                  </span>
                  <span className="text-[10px] font-bold text-base-content/70 flex items-center gap-1">
                    <ArrowLeftRight className="w-3 h-3 text-secondary" />
                    Swap OK (+₦85k)
                  </span>
                </div>
              </div>

              {/* Card 3: Front Center Showpiece Card */}
              <div
                onClick={() => handleCategorySelect("iphone-16-pro")}
                className="relative z-20 w-full h-full rounded-3xl bg-linear-to-tr from-primary/15 via-base-100 to-secondary/10 p-6 sm:p-7 flex flex-col justify-between border border-base-300 shadow-2xl transition-all duration-500 group-hover:translate-y-2 group-hover:scale-[1.01] hover:scale-[1.02] cursor-pointer overflow-hidden"
              >
                {/* Top Badges */}
                <div className="flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-base-100/90 border border-base-300 shadow-xs text-xs font-bold text-base-content backdrop-blur-xs">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span>Verified Flagship</span>
                  </div>

                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/20 border border-primary/30 text-xs font-black text-primary-content">
                    <Sparkles className="w-3 h-3 text-primary fill-primary" />
                    <span className="font-mono">100% Battery</span>
                  </div>
                </div>

                {/* Hero Phone Showcase */}
                <div className="relative flex-1 flex items-center justify-center my-2">
                  <div className="absolute w-44 h-44 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
                  <img
                    src="/iphone_1.png"
                    alt="Latest iPhone Flagship"
                    className="w-full h-full max-h-60 object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Bottom Spec & Swap Info Card */}
                <div className="space-y-2 bg-base-100/95 p-3.5 rounded-2xl border border-base-300/80 shadow-sm backdrop-blur-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-sm text-base-content tracking-tight">
                        iPhone 16 Pro Max
                      </h4>
                      <p className="text-[11px] text-base-content/60 font-semibold">
                        Natural Titanium &bull; 256GB &bull; Unlocked
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-primary font-mono block leading-none">
                        ₦1,350,000
                      </span>
                      <span className="text-[10px] font-bold text-base-content/50">
                        or direct swap
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-base-200 flex items-center justify-between text-[11px] text-base-content/75 font-semibold">
                    <span className="flex items-center gap-1 text-secondary">
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                      <span>Instant Trade Valuation</span>
                    </span>
                    <span className="text-base-content/50">Ikeja, Lagos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
