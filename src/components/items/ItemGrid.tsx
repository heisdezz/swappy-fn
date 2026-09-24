import { Smartphone } from "lucide-react";
import { ItemCard, type ItemCardRecord } from "./ItemCard";

interface ItemGridProps {
  listings: ItemCardRecord[];
  emptyMessage?: string;
  className?: string;
}

export function ItemGrid({
  listings,
  emptyMessage = "No smartphone listings found matching your criteria.",
  className = "",
}: ItemGridProps) {
  if (!listings || listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-base-200/50 rounded-3xl border border-dashed border-base-300">
        <Smartphone className="w-12 h-12 text-base-content/40 mb-3 stroke-[1.5]" />
        <h3 className="font-bold text-lg text-base-content">No Devices Found</h3>
        <p className="text-sm text-base-content/70 mt-1 max-w-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}
    >
      {listings.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
