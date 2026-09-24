import {
  CheckCircle2,
  Clock,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import type { StoreDetailRecord } from "../../server/listings";

interface StoreBannerProps {
  store: StoreDetailRecord;
  totalInventory: number;
}

export function StoreBanner({ store, totalInventory }: StoreBannerProps) {
  const cleanWhatsapp = store.whatsapp
    ? store.whatsapp.replace(/[^0-9]/g, "")
    : "";
  const whatsappUrl = cleanWhatsapp
    ? `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(`Hello ${store.name}, I am viewing your store inventory on Swappy.`)}`
    : undefined;

  return (
    <div className="bg-base-100 rounded-3xl border border-base-300 p-6 sm:p-8 shadow-sm relative overflow-hidden">
      {/* Background Yellow Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Avatar, Name, Address & Badges */}
        <div className="flex items-start sm:items-center gap-4 sm:gap-6">
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-primary text-primary-content font-black text-2xl sm:text-3xl flex items-center justify-center shadow-md flex-shrink-0 border-2 border-primary/20">
            {store.name ? store.name.charAt(0).toUpperCase() : "S"}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-base-content tracking-tight">
                {store.name}
              </h1>
              {store.is_verified && (
                <span className="badge badge-accent badge-md gap-1.5 font-bold text-accent-content">
                  <ShieldCheck className="w-4 h-4" />
                  Verified Merchant
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs sm:text-sm text-base-content/70 flex-wrap">
              <span className="flex items-center gap-1 font-semibold text-base-content">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                {store.city || "Lagos"}, {store.state || "Nigeria"}
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-secondary" />
                {totalInventory} Listed iPhones
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-success" />
                Open Mon - Sat (9am - 6pm)
              </span>
            </div>

            {store.address && (
              <p className="text-xs text-base-content/60 max-w-xl">
                {store.address}
              </p>
            )}
          </div>
        </div>

        {/* Right: Direct Contact Actions */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary text-secondary-content rounded-xl font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-sm flex-1 sm:flex-none"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Store</span>
            </a>
          )}

          {store.phone && (
            <a
              href={`tel:${store.phone}`}
              className="btn btn-primary rounded-xl font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-sm flex-1 sm:flex-none"
            >
              <Phone className="w-4 h-4" />
              <span>Call Merchant</span>
            </a>
          )}
        </div>
      </div>

      {/* Safety & Store Assurance Strip */}
      <div className="relative z-10 mt-6 pt-5 border-t border-base-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-base-content/75">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
          <span>Walk-in physical shop inspection available</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
          <span>All phones factory unlocked and verified</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
          <span>Direct dealer warranty and swap options</span>
        </div>
      </div>
    </div>
  );
}
