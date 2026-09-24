import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowLeftRight,
  CheckCircle2,
  ChevronRight,
  Info,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { getItemBySlugFn } from "../../server/listings";
import { PublicNavbar } from "../../components/layout/PublicNavbar";
import { Footer } from "../../components/layout/Footer";
import { ImageGallery } from "../../components/items/ImageGallery";
import { DeviceSpecsMatrix } from "../../components/items/DeviceSpecsMatrix";
import { SellerContactCard } from "../../components/items/SellerContactCard";
import { SwapModal } from "../../components/items/SwapModal";
import { ItemChatDrawer } from "../../components/items/ItemChatDrawer";
import { ItemGrid } from "../../components/items/ItemGrid";
import { BatteryBadge } from "../../components/items/BatteryBadge";
import { ConditionBadge } from "../../components/items/ConditionBadge";
import { SafetyAlert } from "../../components/common/SafetyAlert";

export const Route = createFileRoute("/items/$slug")({
  loader: async ({ params }) =>
    await getItemBySlugFn({ data: { slug: params.slug } }),
  component: ItemDetailPage,
});

function ItemDetailPage() {
  const { item, relatedItems } = Route.useLoaderData();
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);

  // Trigger non-blocking visit analytics on mount
  useEffect(() => {
    if (item?.id) {
      const backendUrl =
        import.meta.env.VITE_POCKETBASE_URL || "http://127.0.0.1:8090";
      fetch(
        `${backendUrl}/api/analytics/items/${encodeURIComponent(item.id)}/visit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
      ).catch(() => {
        // Non-blocking visit increment
      });
    }
  }, [item?.id]);

  if (!item) {
    return (
      <div className="min-h-screen bg-base-100 text-base-content flex flex-col antialiased">
        <PublicNavbar />
        <main className="flex-1 container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-base-200 border border-base-300 flex items-center justify-center text-base-content/40">
            <Smartphone className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-base-content">
              Listing Not Found
            </h1>
            <p className="text-sm text-base-content/60 max-w-md mx-auto">
              This iPhone listing may have been sold, swapped, or removed by the
              seller.
            </p>
          </div>
          <Link
            to="/explore"
            className="btn btn-primary rounded-xl font-bold px-6 text-sm"
          >
            Browse Available iPhones
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 text-base-content flex flex-col antialiased">
      <PublicNavbar />

      <main className="flex-1 container mx-auto px-4 py-6 md:py-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-base-content/60">
          <Link to="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/explore" className="hover:text-primary transition-colors">
            iPhones
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-base-content font-semibold truncate max-w-xs sm:max-w-md">
            {item.title || "Device Details"}
          </span>
        </nav>

        {/* Back Button */}
        <div>
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-base-content/70 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Catalog</span>
          </Link>
        </div>

        {/* Main 2-Column Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Gallery, Specs & Transparency (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Multi-Photo Gallery */}
            <ImageGallery
              images={item.images}
              collectionName={item.collectionName || "items"}
              itemId={item.id}
              title={item.title}
              isPromoted={item.is_promoted}
              acceptsSwap={item.accepts_swap}
            />

            {/* Title & Badges */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                {item.storage && (
                  <span className="badge badge-neutral font-bold text-xs">
                    {item.storage}
                  </span>
                )}
                <BatteryBadge percentage={item.battery_health} />
                <ConditionBadge condition={item.condition} />
                {item.carrier_status === "factory_unlocked" && (
                  <span className="badge badge-outline badge-success text-xs font-semibold">
                    Factory Unlocked
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-base-content tracking-tight">
                {item.title || "Apple iPhone"}
              </h1>
            </div>

            {/* Swap Preferences Notice (if enabled) */}
            {item.accepts_swap && (
              <div className="p-4 rounded-2xl bg-secondary/10 border border-secondary/20 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-secondary text-secondary-content flex items-center justify-center font-bold">
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                  </span>
                  <span className="font-extrabold text-sm text-base-content">
                    Seller Accepts Device Swap
                  </span>
                </div>
                <p className="text-xs text-base-content/80 leading-relaxed pl-8">
                  {item.swap_preferences ||
                    "Open to swap proposals with cash adjustments. Submit your offered device specifications to calculate top-up balance."}
                </p>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2 pt-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/80 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-primary" />
                <span>Device Description</span>
              </h3>
              <div className="p-4 rounded-2xl bg-base-200/50 border border-base-300 text-xs text-base-content/80 leading-relaxed whitespace-pre-line">
                {item.description ||
                  "Verified iPhone listing tested for battery performance, camera functionality, Face ID sensors, and physical cosmetic condition."}
              </div>
            </div>

            {/* Known Issues / Disclosures */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/80 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-warning" />
                <span>Known Flaws & Transparency Disclosure</span>
              </h3>
              <div className="p-4 rounded-2xl bg-base-200/50 border border-base-300 text-xs text-base-content/80 leading-relaxed">
                {item.issues ||
                  "No functional defects disclosed by seller. All buttons, speakers, and wireless connections confirmed operable."}
              </div>
            </div>

            {/* Hardware & Diagnostics Matrix */}
            <DeviceSpecsMatrix item={item} />

            {/* In-Person Handover Checklist */}
            <div className="p-5 rounded-2xl bg-base-200/70 border border-base-300 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-success" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-base-content">
                  Buyer In-Person Inspection Protocol
                </h4>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-base-content/75">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                  <span>Confirm Settings Battery Health percentage</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                  <span>Sign in and test iCloud activation status</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                  <span>Test front and rear camera focus</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                  <span>Insert local SIM and test phone call audio</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Sticky Seller Contact & Pricing Card (5 Cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
            <SellerContactCard
              item={item}
              onOpenSwapModal={() => setIsSwapModalOpen(true)}
              onOpenChatDrawer={() => setIsChatDrawerOpen(true)}
            />

            <SafetyAlert />
          </div>
        </div>

        {/* Similar Verified Deals Section */}
        {relatedItems && relatedItems.length > 0 && (
          <div className="pt-10 border-t border-base-200 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-primary text-primary-content">
                  <Sparkles className="w-4 h-4 stroke-[2.5]" />
                </span>
                <h2 className="text-lg sm:text-xl font-black text-base-content tracking-tight">
                  Similar Verified iPhone Deals
                </h2>
              </div>

              <Link
                to="/explore"
                className="text-xs font-bold text-primary hover:underline"
              >
                View all in catalog
              </Link>
            </div>

            <ItemGrid listings={relatedItems} />
          </div>
        )}
      </main>

      <Footer />

      {/* Trade-In Proposal Modal */}
      {item.accepts_swap && (
        <SwapModal
          isOpen={isSwapModalOpen}
          onClose={() => setIsSwapModalOpen(false)}
          targetItem={item}
        />
      )}

      {/* Authenticated In-Page Chat Drawer */}
      <ItemChatDrawer
        isOpen={isChatDrawerOpen}
        onClose={() => setIsChatDrawerOpen(false)}
        itemIdentifier={item.id}
        itemTitle={item.title || "iPhone"}
        sellerName={item.seller?.name || "Seller"}
        sellerId={item.seller?.id}
      />
    </div>
  );
}
