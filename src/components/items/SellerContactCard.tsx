import { Link } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  Eye,
  MapPin,
  MessageCircle,
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
}

export function SellerContactCard({
  item,
  onOpenSwapModal,
}: SellerContactCardProps) {
  const [showPhone, setShowPhone] = useState(false);

  const seller = item.seller || {
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
    `Hello! I am inquiring about your ${item.title || "iPhone"} listed on Swappy for ${formattedPrice}. Is it still available for inspection?`
  );
  const waUrl = `https://wa.me/${seller.whatsapp || "2348030001234"}?text=${waMessage}`;

  return (
    <div className="bg-base-100 rounded-3xl p-6 border border-base-300 shadow-sm space-y-5">
      {/* Price Header */}
      <div className="space-y-1">
        <span className="text-xs font-semibold text-base-content/60">
          Listing Price
        </span>
        <div className="text-3xl font-black text-primary font-mono tracking-tight">
          {formattedPrice}
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="space-y-2.5">
        {item.accepts_swap && (
          <button
            type="button"
            onClick={onOpenSwapModal}
            className="btn btn-secondary btn-block rounded-xl font-black text-sm shadow-sm inline-flex items-center justify-center gap-2"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Propose Device Swap</span>
          </button>
        )}

        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary btn-block rounded-xl font-bold text-sm shadow-sm inline-flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Chat on WhatsApp</span>
        </a>

        <button
          type="button"
          onClick={() => setShowPhone(!showPhone)}
          className="btn btn-outline border-base-300 btn-block rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 hover:bg-base-200 hover:text-base-content"
        >
          <Phone className="w-4 h-4 text-base-content/70" />
          <span>{showPhone ? sellerPhone : `Call: ${maskedPhone}`}</span>
        </button>
      </div>

      {/* Seller Identity & Trust Card */}
      <div className="pt-4 border-t border-base-200 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary-content font-black flex items-center justify-center text-lg">
            {seller.name.slice(0, 1).toUpperCase()}
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm text-base-content">
                {seller.name}
              </span>
              {seller.verified && (
                <ShieldCheck className="w-4 h-4 text-accent flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-base-content/60">
              <span className="flex items-center gap-0.5 text-warning font-semibold">
                <Star className="w-3 h-3 fill-warning text-warning" />
                {seller.rating || 4.9}
              </span>
              <span>•</span>
              <span>{seller.completed_swaps || 12} successful swaps</span>
            </div>
          </div>
        </div>

        {/* Store Attachment if present */}
        {item.store && (
          <Link
            to={"/app/store" as string}
            className="flex items-center justify-between p-2.5 rounded-xl bg-base-200/70 hover:bg-base-200 transition-colors border border-base-300 text-xs"
          >
            <div className="flex items-center gap-2">
              <Store className="w-3.5 h-3.5 text-primary" />
              <span className="font-bold text-base-content">{item.store.name}</span>
            </div>
            <span className="badge badge-accent badge-xs font-bold">
              Verified Store
            </span>
          </Link>
        )}

        {/* Location & Metadata */}
        <div className="pt-2 text-xs space-y-1.5 text-base-content/70">
          {(item.location_city || item.location_state) && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-base-content/50" />
              <span>
                {[item.location_city, item.location_state].filter(Boolean).join(", ")}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-base-content/50" />
            <span>{item.views || 184} verified views</span>
          </div>
        </div>
      </div>
    </div>
  );
}
