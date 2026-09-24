import { Link } from "@tanstack/react-router";
import {
  ExternalLink,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { getItemCardImageUrl, getStoreImageUrl } from "../../helpers/images";
import type { StoreDetailRecord } from "../../server/listings";

interface StoreCardProps {
  store: StoreDetailRecord;
}

export function StoreCard({ store }: StoreCardProps) {
  const cleanWhatsapp = store.whatsapp
    ? store.whatsapp.replace(/[^0-9]/g, "")
    : "";
  const whatsappUrl = cleanWhatsapp
    ? `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(`Hello ${store.name}, I found your store on Swappy and want to inquire about your iPhone inventory.`)}`
    : undefined;

  const storeLogoUrl = getStoreImageUrl(store, "logo");

  return (
    <div className="bg-base-100 rounded-3xl border border-base-300 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Top Header: Logo / Avatar & Verification Badge */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary-content flex items-center justify-center font-black text-xl shadow-sm border border-primary/30 shrink-0 overflow-hidden">
              {storeLogoUrl ? (
                <img
                  src={storeLogoUrl}
                  alt={store.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : store.name ? (
                store.name.charAt(0).toUpperCase()
              ) : (
                "S"
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  to={"/store/$slug" as string}
                  params={{ slug: store.slug }}
                  className="font-black text-lg sm:text-xl text-base-content hover:text-primary transition-colors"
                >
                  {store.name}
                </Link>
                {store.is_verified && (
                  <span className="badge badge-accent badge-sm gap-1 font-bold text-accent-content text-xs px-2.5 py-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-base-content/70 mt-1">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span className="truncate max-w-[220px]">
                  {store.city || "Lagos"}, {store.state || "Nigeria"}
                </span>
              </div>
            </div>
          </div>

          {/* Active Inventory Count */}
          <div className="badge badge-neutral badge-sm font-bold shrink-0 py-2.5 px-3 text-xs">
            <Smartphone className="w-3.5 h-3.5 mr-1" />
            <span>{store.item_count || 0} iPhones</span>
          </div>
        </div>

        {/* Address / Description */}
        <p className="text-sm sm:text-base text-base-content/80 mt-4 line-clamp-2 leading-relaxed">
          {store.description ||
            store.address ||
            "Certified physical dealer with verified iPhone stock."}
        </p>

        {store.address && (
          <div className="mt-3.5 p-3.5 rounded-2xl bg-base-200/60 border border-base-300/80 text-xs sm:text-sm text-base-content/85 flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span className="line-clamp-2">{store.address}</span>
          </div>
        )}

        {/* Mini Preview Strip of Top Listed Devices */}
        {store.featured_items && store.featured_items.length > 0 && (
          <div className="mt-5 pt-4 border-t border-base-200">
            <div className="text-xs font-bold text-base-content/65 uppercase tracking-wider mb-2.5">
              Featured Stock
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {store.featured_items.map((it) => {
                const itemImg = getItemCardImageUrl(it, "120x120");
                return (
                  <div
                    key={it.id}
                    className="bg-base-200/50 rounded-2xl p-2.5 border border-base-300/60 flex flex-col items-center text-center group-hover:border-primary/30 transition-colors"
                  >
                    <img
                      src={itemImg}
                      alt={it.title || "iPhone"}
                      className="w-12 h-12 object-contain mb-1.5"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.src.includes("/iphone_")) {
                          target.src = "/iphone_1.png";
                        }
                      }}
                    />
                    <div className="text-xs font-extrabold truncate w-full text-base-content">
                      {it.title || "iPhone"}
                    </div>
                    <div className="text-xs font-black text-primary mt-0.5">
                      {typeof it.price === "number"
                        ? new Intl.NumberFormat("en-NG", {
                            style: "currency",
                            currency: "NGN",
                            maximumFractionDigits: 0,
                          }).format(it.price)
                        : "Check price"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-6 pt-5 border-t border-base-200 flex items-center gap-2.5">
        <Link
          to={"/store/$slug" as string}
          params={{ slug: store.slug }}
          className="btn btn-primary btn-sm h-10 rounded-xl font-bold flex-1 text-xs sm:text-sm"
        >
          <span>Visit Store</span>
          <ExternalLink className="w-4 h-4 ml-1" />
        </Link>

        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-sm h-10 btn-square rounded-xl text-success hover:bg-success/15 border border-base-300"
            title="Chat with store on WhatsApp"
            aria-label="Chat on WhatsApp"
          >
            <MessageSquare className="w-4.5 h-4.5" />
          </a>
        )}

        {store.phone && (
          <a
            href={`tel:${store.phone}`}
            className="btn btn-ghost btn-sm h-10 btn-square rounded-xl text-base-content/70 hover:bg-base-200 border border-base-300"
            title={`Call ${store.phone}`}
            aria-label="Call store"
          >
            <Phone className="w-4.5 h-4.5" />
          </a>
        )}
      </div>
    </div>
  );
}
