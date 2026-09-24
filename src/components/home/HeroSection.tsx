import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  Flame,
  ShieldCheck,
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

          {/* Right Column: Hero Visual Showcase */}
          <div className="lg:col-span-5 relative hidden lg:block">
            <div className="relative mx-auto w-full max-w-md aspect-4/5 rounded-3xl bg-linear-to-tr from-primary/10 via-base-200 to-secondary/10 p-8 flex items-center justify-center border border-base-300 shadow-2xl">
              <img
                src="/iphone_1.png"
                alt="Latest iPhone Flagship"
                className="w-full h-full object-contain drop-shadow-2xl transition-transform hover:scale-105 duration-500"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
