import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import type { ItemCardRecord } from "../items/ItemCard";
import { ItemCard } from "../items/ItemCard";

interface PromotedCarouselProps {
  listings: ItemCardRecord[];
}

export function PromotedCarousel({ listings }: PromotedCarouselProps) {
  if (!listings || listings.length === 0) return null;

  return (
    <section className="py-8 bg-base-100 border-b border-base-200">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary text-primary-content">
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-base-content">
              Promoted Spotlight
            </h2>
          </div>

          <Link
            to={"/explore" as string}
            className="text-xs font-bold text-primary hover:underline"
          >
            View all featured devices
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5">
          {listings.slice(0, 3).map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
