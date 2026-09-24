import { Link } from "@tanstack/react-router";
import {
  ExternalLink,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
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

  return (
    <div className="bg-base-100 rounded-3xl border border-base-300 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Top Header: Logo / Avatar & Verification Badge */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary-content flex items-center justify-center font-black text-xl shadow-sm border border-primary/30 flex-shrink-0">
              {store.name ? store.name.charAt(0).toUpperCase() : "S"}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link
                  to={"/store/$slug" as string}
                  params={{ slug: store.slug }}
                  className="font-black text-lg text-base-content hover:text-primary transition-colors"
                >
                  {store.name}
                </Link>
                {store.is_verified && (
                  <span className="badge badge-accent badge-sm gap-1 font-bold text-accent-content">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-base-content/60 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="truncate max-w-[220px]">
                  {store.city || "Lagos"}, {store.state || "Nigeria"}
                </span>
              </div>
            </div>
          </div>

          {/* Active Inventory Count */}
          <div className="badge badge-neutral badge-sm font-bold flex-shrink-0 py-2.5 px-3">
            <Smartphone className="w-3 h-3 mr-1" />
            <span>{store.item_count || 0} iPhones</span>
          </div>
        </div>

        {/* Address / Description */}
        <p className="text-xs text-base-content/70 mt-4 line-clamp-2 leading-relaxed">
          {store.description ||
            store.address ||
            "Certified physical dealer with verified iPhone stock."}
        </p>

        {store.address && (
          <div className="mt-3 p-3 rounded-2xl bg-base-200/50 border border-base-300/80 text-[11px] text-base-content/80 flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2">{store.address}</span>
          </div>
        )}

        {/* Mini Preview Strip of Top Listed Devices */}
        {store.featured_items && store.featured_items.length > 0 && (
          <div className="mt-4 pt-4 border-t border-base-200">
            <div className="text-[11px] font-bold text-base-content/60 uppercase tracking-wider mb-2">
              Featured Stock
            </div>
            <div className="grid grid-cols-3 gap-2">
              {store.featured_items.map((it) => (
                <div
                  key={it.id}
                  className="bg-base-200/40 rounded-xl p-2 border border-base-300/60 flex flex-col items-center text-center group-hover:border-primary/30 transition-colors"
                >
                  <img
                    src={it.images?.[0] || "/iphone_1.png"}
                    alt={it.title || "iPhone"}
                    className="w-10 h-10 object-contain mb-1"
                  />
                  <div className="text-[10px] font-extrabold truncate w-full text-base-content">
                    {it.title || "iPhone"}
                  </div>
                  <div className="text-[10px] font-black text-primary">
                    {typeof it.price === "number"
                      ? new Intl.NumberFormat("en-NG", {
                          style: "currency",
                          currency: "NGN",
                          maximumFractionDigits: 0,
                        }).format(it.price)
                      : "Check price"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-6 pt-4 border-t border-base-200 flex items-center gap-2">
        <Link
          to={"/store/$slug" as string}
          params={{ slug: store.slug }}
          className="btn btn-primary btn-sm rounded-xl font-bold flex-1 text-xs"
        >
          <span>View Storefront</span>
          <ExternalLink className="w-3.5 h-3.5 ml-1" />
        </Link>

        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm text-secondary-content btn-square rounded-xl"
            title="Chat on WhatsApp"
            aria-label={`Chat with ${store.name} on WhatsApp`}
          >
            <MessageSquare className="w-4 h-4" />
          </a>
        )}

        {store.phone && (
          <a
            href={`tel:${store.phone}`}
            className="btn btn-outline btn-sm btn-square rounded-xl border-base-300"
            title="Call Store"
            aria-label={`Call ${store.name}`}
          >
            <Phone className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
}
