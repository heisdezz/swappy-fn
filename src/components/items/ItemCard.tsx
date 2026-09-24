import { Link } from "@tanstack/react-router";
import { ArrowLeftRight, MapPin, Smartphone } from "lucide-react";
import { BatteryBadge } from "./BatteryBadge";
import { ConditionBadge } from "./ConditionBadge";
import { getItemCardImageUrl } from "../../helpers/images";
import { createItemSlug } from "../../utils/slug";

export interface ItemCardRecord {
  id: string;
  collectionId?: string;
  collectionName?: string;
  title?: string;
  price?: number;
  storage?: string;
  color?: string;
  battery_health?: number;
  condition?: string;
  carrier_status?: string;
  sim_type?: string;
  accepts_swap?: boolean;
  swap_preferences?: string;
  location_city?: string;
  location_state?: string;
  is_promoted?: boolean;
  images?: string[];
  created?: string;
  updated?: string;
}

interface ItemCardProps {
  item: ItemCardRecord;
  className?: string;
}

export function ItemCard({ item, className = "" }: ItemCardProps) {
  const imageUrl = getItemCardImageUrl(item, "400x300");

  const formattedPrice = item.price
    ? new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
      }).format(item.price)
    : "Price on request";

  const locationText = [item.location_city, item.location_state]
    .filter(Boolean)
    .join(", ");

  const itemDetailUrl = `/items/${createItemSlug(item)}`;

  return (
    <div
      className={`card bg-base-100 border border-base-300 shadow-xs hover:shadow-md transition-shadow overflow-hidden group rounded-3xl ${className}`}
    >
      <Link to={itemDetailUrl as string} className="block overflow-hidden">
        <figure className="relative aspect-4/3 bg-base-200 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={item.title || "iPhone listing"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              onError={(e) => {
                // If remote upload fails or 404s, gracefully fallback to bundled asset
                const target = e.currentTarget;
                if (!target.src.includes("/iphone_")) {
                  target.src = "/iphone_1.png";
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-base-content/40">
              <Smartphone className="w-12 h-12 stroke-[1.5]" />
              <span className="text-sm mt-1.5 font-medium">
                No photo available
              </span>
            </div>
          )}

          {item.is_promoted && (
            <span className="badge badge-primary text-primary-content badge-md font-bold absolute top-3 left-3 shadow-sm text-xs">
              Featured
            </span>
          )}

          {item.accepts_swap && (
            <span
              className="badge badge-secondary text-secondary-content badge-md font-bold absolute top-3 right-3 shadow-sm inline-flex items-center gap-1.5 text-xs"
              title="Seller accepts swap proposals"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Swap</span>
            </span>
          )}
        </figure>
      </Link>

      <div className="card-body p-5 space-y-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          {item.storage && (
            <span className="badge badge-neutral badge-sm font-bold text-xs px-2.5 py-1">
              {item.storage}
            </span>
          )}
          <BatteryBadge percentage={item.battery_health} />
          <ConditionBadge condition={item.condition} />
        </div>

        <Link
          to={itemDetailUrl as string}
          className="font-extrabold text-base sm:text-lg line-clamp-1 hover:text-primary transition-colors text-base-content"
          title={item.title || "iPhone"}
        >
          {item.title || "iPhone Listing"}
        </Link>

        <div className="text-xl sm:text-2xl font-black text-primary font-mono tracking-tight">
          {formattedPrice}
        </div>

        {locationText && (
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-base-content/75 font-medium pt-0.5">
            <MapPin className="w-4 h-4 flex-shrink-0 text-primary" />
            <span className="truncate">{locationText}</span>
          </div>
        )}
      </div>
    </div>
  );
}
