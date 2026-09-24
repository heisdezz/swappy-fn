import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Building2, ChevronRight, Smartphone } from "lucide-react";
import { ItemGrid } from "../../components/items/ItemGrid";
import { Footer } from "../../components/layout/Footer";
import { PublicNavbar } from "../../components/layout/PublicNavbar";
import { SafetyAlert } from "../../components/common/SafetyAlert";
import { StoreBanner } from "../../components/store/StoreBanner";
import { getStoreBySlugFn } from "../../server/listings";

export const Route = createFileRoute("/store/$slug")({
  loader: async ({ params }) =>
    await getStoreBySlugFn({ data: { slug: params.slug } }),
  component: StorefrontPage,
});

function StorefrontPage() {
  const { store, inventory } = Route.useLoaderData();

  if (!store) {
    return (
      <div className="min-h-screen bg-base-100 text-base-content flex flex-col antialiased">
        <PublicNavbar />
        <main className="flex-1 container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-3xl bg-error/15 text-error flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-base-content">
            Storefront Not Found
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70 max-w-md mt-2 mb-6">
            The phone store you are looking for may have moved, been renamed, or
            is currently undergoing verification.
          </p>
          <Link
            to="/stores"
            className="btn btn-primary rounded-xl font-bold inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse All Verified Stores</span>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 text-base-content flex flex-col antialiased">
      <PublicNavbar />

      <main className="flex-1 container mx-auto px-4 py-6 space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5 text-xs text-base-content/60">
          <Link to="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/stores" className="hover:text-primary transition-colors">
            Verified Stores
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-bold text-base-content truncate max-w-xs">
            {store.name}
          </span>
        </div>

        {/* Store Profile Hero Banner */}
        <StoreBanner store={store} totalInventory={inventory.length} />

        {/* Store Active Stock Header */}
        <div className="pt-2">
          <div className="flex items-center justify-between pb-4 border-b border-base-200">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-base-content tracking-tight flex items-center gap-2">
                <span>Available iPhone Inventory</span>
                <span className="badge badge-primary badge-sm font-bold">
                  {inventory.length}
                </span>
              </h2>
              <p className="text-xs text-base-content/60 mt-0.5">
                All devices physically in-stock at {store.name}
              </p>
            </div>
          </div>

          {/* Device Grid */}
          <div className="py-6">
            {inventory.length > 0 ? (
              <ItemGrid listings={inventory} />
            ) : (
              <div className="text-center py-16 bg-base-200/30 rounded-3xl border border-dashed border-base-300 space-y-3">
                <Smartphone className="w-12 h-12 text-base-content/30 mx-auto" />
                <h3 className="font-bold text-lg text-base-content">
                  No active listings available right now
                </h3>
                <p className="text-xs text-base-content/60 max-w-sm mx-auto">
                  {store.name} has not published any new iPhone stock yet today.
                  Contact them directly on WhatsApp for incoming shipments.
                </p>
                {store.whatsapp && (
                  <a
                    href={`https://wa.me/${store.whatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary text-secondary-content btn-sm rounded-xl font-bold mt-2"
                  >
                    Inquire on WhatsApp
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Safety Alert */}
        <SafetyAlert />
      </main>

      <Footer />
    </div>
  );
}
