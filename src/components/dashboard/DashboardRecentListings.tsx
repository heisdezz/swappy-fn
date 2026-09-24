import { Link } from "@tanstack/react-router";
import { ExternalLink, Plus, Smartphone } from "lucide-react";
import type { ItemCardRecord } from "../items/ItemCard";
import { getItemCardImageUrl } from "../../helpers/images";
import { createItemSlug } from "../../utils/slug";

interface DashboardRecentListingsProps {
  listings: ItemCardRecord[];
  onOpenCreateModal?: () => void;
}

export function DashboardRecentListings({
  listings,
}: DashboardRecentListingsProps) {
  return (
    <div className="bg-base-100 rounded-3xl border border-base-300 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-base-200">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-base-content tracking-tight">
              My Active iPhone Listings
            </h2>
            <p className="text-xs sm:text-sm text-base-content/65 mt-1">
              Manage inventory currently live on the marketplace
            </p>
          </div>

          <Link
            to="/dashboard/phones/new"
            className="btn btn-primary btn-sm rounded-xl font-bold inline-flex items-center gap-1.5 shadow-xs text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add iPhone</span>
          </Link>
        </div>

        {listings.length > 0 ? (
          <div className="mt-5 space-y-3.5">
            {listings.map((item) => {
              const formattedPrice = item.price
                ? new Intl.NumberFormat("en-NG", {
                    style: "currency",
                    currency: "NGN",
                    maximumFractionDigits: 0,
                  }).format(item.price)
                : "Contact";

              const itemSlug = createItemSlug(item);
              const imageUrl = getItemCardImageUrl(item, "200x200");

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-base-200/50 border border-base-300/60 hover:border-primary/30 transition-all gap-4"
                >
                  {/* Left: Device Image & Info */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={imageUrl}
                      alt={item.title || "iPhone"}
                      className="w-14 h-14 object-contain rounded-xl bg-base-100 p-1 border border-base-300/40 shrink-0"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.src.includes("/iphone_")) {
                          target.src = "/iphone_1.png";
                        }
                      }}
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm sm:text-base text-base-content truncate max-w-[200px] sm:max-w-xs">
                          {item.title}
                        </span>
                        {item.accepts_swap && (
                          <span className="badge badge-secondary badge-sm font-bold text-xs">
                            Swap Eligible
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs sm:text-sm text-base-content/70 mt-1 font-medium">
                        <span className="font-black text-primary">
                          {formattedPrice}
                        </span>
                        <span>&bull;</span>
                        <span>{item.storage || "128GB"}</span>
                        <span>&bull;</span>
                        <span>{item.location_city || "Lagos"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <Link
                      to={"/items/$slug" as string}
                      params={{ slug: itemSlug }}
                      className="btn btn-ghost btn-sm rounded-xl text-base-content/70 hover:text-primary"
                      title="View public listing"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-base-200 text-base-content/40 flex items-center justify-center mx-auto">
              <Smartphone className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-base-content/60">
              No devices listed yet. Post your first iPhone to begin trading.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
