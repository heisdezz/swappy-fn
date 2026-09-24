import { useNavigate } from "@tanstack/react-router";
import { ArrowLeftRight, MapPin, Search, ShieldCheck, Zap } from "lucide-react";
import { useState } from "react";

const popularModels = [
  "All",
  "iPhone 15 Pro Max",
  "iPhone 15 Pro",
  "iPhone 14 Pro Max",
  "iPhone 13 Pro Max",
  "iPhone 13",
  "iPhone 12 Pro",
];

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModel, setSelectedModel] = useState("All");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    }
    if (selectedModel !== "All") {
      params.set("model", selectedModel);
    }
    navigate({
      to: `/explore?${params.toString()}` as string,
    });
  };

  const handleModelSelect = (model: string) => {
    setSelectedModel(model);
    const params = new URLSearchParams();
    if (model !== "All") {
      params.set("model", model);
    }
    navigate({
      to: `/explore?${params.toString()}` as string,
    });
  };

  return (
    <section className="relative overflow-hidden bg-base-100 py-12 md:py-18 lg:py-20 border-b border-base-200">
      {/* Background Subtle Warm Ambient Glow */}
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Text, Search, Filters */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="space-y-4">
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

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-xl">
              <div className="join w-full shadow-sm bg-base-100 p-1.5 rounded-2xl border border-base-300">
                <div className="join-item flex items-center pl-3 flex-1">
                  <Search className="w-5 h-5 text-base-content/40 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search model, storage, or city (e.g. 15 Pro Max 256GB Ikeja)..."
                    className="input input-ghost w-full focus:outline-none focus:bg-transparent text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary join-item rounded-xl font-bold px-6 text-sm"
                >
                  Search Deals
                </button>
              </div>
            </form>

            {/* Popular Model Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-xs font-semibold text-base-content/60 mr-1">
                Popular:
              </span>
              {popularModels.map((model) => {
                const isActive = selectedModel === model;
                return (
                  <button
                    key={model}
                    type="button"
                    onClick={() => handleModelSelect(model)}
                    className={`btn btn-xs rounded-lg transition-colors font-medium ${
                      isActive
                        ? "btn-primary shadow-sm"
                        : "btn-ghost bg-base-200/80 hover:bg-base-300 border border-base-200"
                    }`}
                  >
                    {model}
                  </button>
                );
              })}
            </div>

            {/* Trust Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-base-200 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-primary/20 text-base-content flex items-center justify-center font-bold flex-shrink-0">
                  <Zap className="w-3.5 h-3.5 text-base-content" />
                </span>
                <span className="text-xs font-bold text-base-content leading-tight">
                  Verified Battery Health
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center font-bold flex-shrink-0">
                  <ArrowLeftRight className="w-3.5 h-3.5 text-base-content" />
                </span>
                <span className="text-xs font-bold text-base-content leading-tight">
                  Cash Adjust Swap
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-accent/20 text-accent flex items-center justify-center font-bold flex-shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-base-content" />
                </span>
                <span className="text-xs font-bold text-base-content leading-tight">
                  In-Person Safety
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Layered Images & Badges */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Image Composition Cards */}
            <div className="relative w-full max-w-md">
              {/* Primary Featured Phone Card */}
              <div className="bg-base-100 rounded-3xl p-5 border border-base-300 shadow-xl relative z-10 transition-transform hover:-translate-y-1 duration-300">
                <div className="flex items-center justify-between pb-3 border-b border-base-200">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-primary font-bold badge-sm">
                      Featured
                    </span>
                    <span className="badge badge-neutral font-mono badge-xs">
                      256GB
                    </span>
                  </div>
                  <span className="badge badge-success badge-xs font-semibold inline-flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5" /> 98% Battery
                  </span>
                </div>

                <div className="py-4 flex items-center justify-center">
                  <img
                    src="/iphone_1.png"
                    alt="iPhone 15 Pro Max Natural Titanium"
                    className="max-h-72 object-contain drop-shadow-md"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-base-content">
                      iPhone 15 Pro Max
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] text-base-content/60">
                      <MapPin className="w-3 h-3" />
                      <span>Ikeja, Lagos</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-primary font-mono block">
                      ₦1,380,000
                    </span>
                    <span className="badge badge-secondary badge-xs font-semibold inline-flex items-center gap-1">
                      <ArrowLeftRight className="w-2.5 h-2.5" /> Accepts Swap
                    </span>
                  </div>
                </div>
              </div>

              {/* Secondary Floating Secondary Device Showcase (Offset Top-Right/Behind) */}
              <div className="hidden sm:block absolute -top-8 -right-6 w-48 bg-base-100 rounded-2xl p-3 border border-base-300 shadow-lg z-0 opacity-90 hover:opacity-100 transition-opacity">
                <div className="aspect-square bg-base-200/60 rounded-xl overflow-hidden flex items-center justify-center p-2 mb-2">
                  <img
                    src="/iphone_13.png"
                    alt="iPhone 13 Midnight"
                    className="max-h-28 object-contain"
                  />
                </div>
                <div className="text-[11px] font-bold text-base-content truncate">
                  iPhone 13 128GB
                </div>
                <div className="text-xs font-extrabold text-primary font-mono">
                  ₦460,000
                </div>
              </div>

              {/* Floating Verified Guarantee Pill */}
              <div className="absolute -bottom-4 -left-4 bg-base-100/95 backdrop-blur px-3.5 py-2 rounded-2xl border border-base-300 shadow-lg z-20 flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-accent/20 text-accent flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4 text-accent" />
                </span>
                <div className="text-left">
                  <span className="text-xs font-extrabold text-base-content block leading-tight">
                    In-Person Inspection
                  </span>
                  <span className="text-[10px] text-base-content/60">
                    Verify hardware before payment
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
