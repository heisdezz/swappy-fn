import { Link } from "@tanstack/react-router";
import { ArrowLeftRight, MapPin, Smartphone } from "lucide-react";
import { BatteryBadge } from "./BatteryBadge";
import { ConditionBadge } from "./ConditionBadge";
import { getPBFileUrl } from "../../client/pb";
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
  const firstImage =
    Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : "";
  const imageUrl = firstImage
    ? firstImage.startsWith("/") || firstImage.startsWith("http")
      ? firstImage
      : getPBFileUrl(
          item.collectionName || "items",
          item.id,
          firstImage,
          "400x300",
        )
    : "";

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
      className={`card bg-base-100 border border-base-300/80 shadow-sm hover:shadow-md transition-shadow overflow-hidden group ${className}`}
    >
      <Link to={itemDetailUrl as string} className="block overflow-hidden">
        <figure className="relative aspect-4/3 bg-base-200 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={item.title || "iPhone listing"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-base-content/40">
              <Smartphone className="w-12 h-12 stroke-[1.5]" />
              <span className="text-xs mt-1">No photo available</span>
            </div>
          )}

          {item.is_promoted && (
            <span className="badge badge-primary text-primary-content badge-sm font-bold absolute top-2.5 left-2.5 shadow-sm">
              Featured
            </span>
          )}

          {item.accepts_swap && (
            <span
              className="badge badge-secondary text-secondary-content badge-sm font-semibold absolute top-2.5 right-2.5 shadow-sm inline-flex items-center gap-1"
              title="Seller accepts swap proposals"
            >
              <ArrowLeftRight className="w-3 h-3" />
              <span>Swap</span>
            </span>
          )}
        </figure>
      </Link>

      <div className="card-body p-4 space-y-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {item.storage && (
            <span className="badge badge-neutral badge-xs font-semibold">
              {item.storage}
            </span>
          )}
          <BatteryBadge percentage={item.battery_health} />
          <ConditionBadge condition={item.condition} />
        </div>

        <Link
          to={itemDetailUrl as string}
          className="font-bold text-base line-clamp-1 hover:text-primary transition-colors text-base-content"
          title={item.title || "iPhone"}
        >
          {item.title || "iPhone Listing"}
        </Link>

        <div className="text-lg font-extrabold text-primary font-mono">
          {formattedPrice}
        </div>

        {locationText && (
          <div className="flex items-center gap-1 text-xs text-base-content/70">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-base-content/50" />
            <span className="truncate">{locationText}</span>
          </div>
        )}
      </div>
    </div>
  );
}
