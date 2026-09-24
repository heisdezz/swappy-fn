import { createFileRoute } from "@tanstack/react-router";
import { PublicNavbar } from "../components/layout/PublicNavbar";
import { Footer } from "../components/layout/Footer";
import { ItemGrid } from "../components/items/ItemGrid";
import { getHomepageDataFn } from "../server/listings";
import { SlidersHorizontal } from "lucide-react";

export const Route = createFileRoute("/explore")({
  loader: async () => await getHomepageDataFn(),
  component: ExplorePage,
});

function ExplorePage() {
  const { recent } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-base-100 text-base-content flex flex-col antialiased">
      <PublicNavbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between pb-6 border-b border-base-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Explore iPhone Catalog
            </h1>
            <p className="text-xs sm:text-sm text-base-content/70 mt-1">
              Filter by model, storage, battery percentage, condition, and location
            </p>
          </div>
          <button className="btn btn-outline btn-sm rounded-xl font-bold inline-flex items-center gap-1.5">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>

        <div className="py-6">
          <ItemGrid listings={recent || []} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
