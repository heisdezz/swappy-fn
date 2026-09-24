import { Link } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  MapPin,
  MessageCircle,
  MessageSquare,
  Phone,
  ShieldCheck,
  Star,
  Store,
} from "lucide-react";
import { useState } from "react";
import type { ItemDetailRecord } from "../../server/listings";

interface SellerContactCardProps {
  item: ItemDetailRecord;
  onOpenSwapModal?: () => void;
  onOpenChatDrawer?: () => void;
}

export function SellerContactCard({
  item,
  onOpenSwapModal,
  onOpenChatDrawer,
}: SellerContactCardProps) {
  const [showPhone, setShowPhone] = useState(false);

  const triggerCopiedAnalytics = async () => {
    try {
      const identifier = item.id;
      const backendUrl =
        import.meta.env.VITE_POCKETBASE_URL || "http://127.0.0.1:8090";
      await fetch(
        `${backendUrl}/api/analytics/items/${encodeURIComponent(identifier)}/copied`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (e) {
      // Non-blocking analytics trigger
    }
  };

  const handleRevealPhone = () => {
    if (!showPhone) {
      triggerCopiedAnalytics();
    }
    setShowPhone(!showPhone);
  };

  const handleWhatsAppClick = () => {
    triggerCopiedAnalytics();
  };

  const seller = item.seller || {
    id: "default-seller",
    name: "Verified Swappy Seller",
    username: "seller",
    phone: "+2348030001234",
    whatsapp: "2348030001234",
    verified: true,
    rating: 4.8,
    completed_swaps: 24,
    member_since: "Joined 2024",
  };

  const sellerPhone = seller.phone || "+2348030001234";
  const maskedPhone = `${sellerPhone.slice(0, 5)} ••• ••••`;

  const formattedPrice = item.price
    ? new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
      }).format(item.price)
    : "Price on request";

  const waMessage = encodeURIComponent(
    `Hello! I am inquiring about your ${item.title || "iPhone"} listed on Swappy for ${formattedPrice}. Is it still available for inspection?`,
  );
  const waUrl = `https://wa.me/${seller.whatsapp || "2348030001234"}?text=${waMessage}`;

  return (
    <div className="bg-base-100 rounded-3xl p-6 sm:p-7 border border-base-300 shadow-sm space-y-6">
      {/* Price Header */}
      <div className="space-y-1.5">
        <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-base-content/65">
          Listing Price
        </span>
        <div className="text-3xl sm:text-4xl font-black text-primary font-mono tracking-tight">
          {formattedPrice}
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="space-y-3">
        {item.accepts_swap && (
          <button
            type="button"
            onClick={onOpenSwapModal}
            className="btn btn-secondary btn-block h-12 rounded-2xl font-black text-sm sm:text-base shadow-sm inline-flex items-center justify-center gap-2.5"
          >
            <ArrowLeftRight className="w-4.5 h-4.5" />
            <span>Propose Device Swap</span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenChatDrawer}
          className="btn btn-primary btn-block h-12 rounded-2xl font-bold text-sm sm:text-base shadow-sm inline-flex items-center justify-center gap-2.5"
        >
          <MessageSquare className="w-4.5 h-4.5" />
          <span>Message Seller (In-App)</span>
        </button>

        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleWhatsAppClick}
          className="btn btn-outline border-base-300 btn-block h-12 rounded-2xl font-bold text-sm sm:text-base shadow-sm inline-flex items-center justify-center gap-2.5 hover:bg-success hover:text-success-content hover:border-success"
        >
          <MessageCircle className="w-4.5 h-4.5 text-success" />
          <span>Chat on WhatsApp</span>
        </a>

        <button
          type="button"
          onClick={handleRevealPhone}
          className="btn btn-ghost border border-base-300 btn-block h-12 rounded-2xl font-bold text-sm sm:text-base inline-flex items-center justify-center gap-2.5 hover:bg-base-200"
        >
          <Phone className="w-4.5 h-4.5 text-base-content/70" />
          <span>{showPhone ? sellerPhone : `Call: ${maskedPhone}`}</span>
        </button>
      </div>

      {/* Seller Identity & Trust Card */}
      <div className="pt-5 border-t border-base-200 space-y-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary-content font-black flex items-center justify-center text-xl shrink-0">
            {seller.name.slice(0, 1).toUpperCase()}
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg text-base-content truncate">
                {seller.name}
              </span>
              {seller.verified && (
                <ShieldCheck className="w-4.5 h-4.5 text-accent shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-base-content/70">
              <span className="flex items-center gap-1 text-warning font-bold">
                <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                {seller.rating || 4.9}
              </span>
              <span>&bull;</span>
              <span>{seller.completed_swaps || 12} successful swaps</span>
            </div>
          </div>
        </div>

        {/* Store badge if associated with merchant store */}
        {item.store && (
          <div className="p-3 rounded-2xl bg-base-200/50 border border-base-300 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Store className="w-4 h-4 text-primary" />
              <div>
                <div className="text-xs font-bold text-base-content">
                  {item.store.name}
                </div>
                <div className="text-[11px] text-base-content/60">
                  Physical Flagship &bull; Verified Merchant
                </div>
              </div>
            </div>
            <Link
              to="/store/$slug"
              params={{ slug: item.store.slug }}
              className="text-xs font-bold text-primary hover:underline"
            >
              Visit Store
            </Link>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-base-content/65 pt-1">
          <MapPin className="w-4 h-4 shrink-0 text-base-content/50" />
          <span>
            {item.location_city || "Ikeja"},{" "}
            {item.location_state || "Lagos State"}
          </span>
        </div>
      </div>
    </div>
  );
}
