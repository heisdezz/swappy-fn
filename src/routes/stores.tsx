import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Building2,
  CheckCircle2,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import { SafetyAlert } from "../components/common/SafetyAlert";
import { Footer } from "../components/layout/Footer";
import { PublicNavbar } from "../components/layout/PublicNavbar";
import { StoreCard } from "../components/store/StoreCard";
import { getStoresFn, type StoreDetailRecord } from "../server/listings";

export const Route = createFileRoute("/stores")({
  loader: async () => await getStoresFn(),
  component: StoresPage,
});

function StoresPage() {
  const { stores } = Route.useLoaderData();
  const [selectedCity, setSelectedCity] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStores = useMemo(() => {
    return (stores || []).filter((store: StoreDetailRecord) => {
      const matchesCity =
        selectedCity === "all" ||
        (store.city &&
          store.city.toLowerCase().includes(selectedCity.toLowerCase())) ||
        (store.state &&
          store.state.toLowerCase().includes(selectedCity.toLowerCase()));

      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !query ||
        store.name.toLowerCase().includes(query) ||
        (store.address && store.address.toLowerCase().includes(query)) ||
        (store.description && store.description.toLowerCase().includes(query));

      return matchesCity && matchesQuery;
    });
  }, [stores, selectedCity, searchQuery]);

  return (
    <div className="min-h-screen bg-base-100 text-base-content flex flex-col antialiased">
      <PublicNavbar />

      <main className="flex-1 container mx-auto px-4 py-8 space-y-10">
        {/* Hero Section */}
        <div className="bg-base-200/60 rounded-3xl border border-base-300 p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-black">
              <ShieldCheck className="w-4 h-4" />
              <span>Certified Merchant Network</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-base-content tracking-tight">
              Verified iPhone Stores & Plugs
            </h1>

            <p className="text-sm sm:text-base text-base-content/70 leading-relaxed">
              Explore trusted phone stores with physical shops in Computer
              Village Ikeja, Banex Plaza Abuja, and other verified dealer hubs
              across Nigeria.
            </p>

            {/* Quick Stats Strip */}
            <div className="pt-2 flex items-center gap-6 text-xs font-bold text-base-content/80 flex-wrap">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                <span>Physical Locations Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-secondary" />
                <span>Genuine Hardware Guaranteed</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                <span>Direct WhatsApp Contact</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* City Chips */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            {[
              { id: "all", label: "All Hubs" },
              { id: "ikeja", label: "Ikeja (Computer Village)" },
              { id: "abuja", label: "Abuja (Banex Plaza)" },
              { id: "lagos", label: "Greater Lagos" },
            ].map((chip) => (
              <button
                key={chip.id}
                onClick={() => setSelectedCity(chip.id)}
                className={`btn btn-sm rounded-xl font-bold whitespace-nowrap ${
                  selectedCity === chip.id
                    ? "btn-primary shadow-sm"
                    : "btn-ghost bg-base-200/60 text-base-content/70"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search store name or address..."
              className="input input-sm input-bordered w-full pl-9 rounded-xl text-xs"
            />
          </div>
        </div>

        {/* Stores Grid */}
        {filteredStores.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-base-200/30 rounded-3xl border border-dashed border-base-300 space-y-3">
            <Building2 className="w-12 h-12 text-base-content/30 mx-auto" />
            <h3 className="font-bold text-lg text-base-content">
              No verified stores found matching your query
            </h3>
            <p className="text-xs text-base-content/60 max-w-sm mx-auto">
              Try adjusting your city filter or search terms to find certified
              iPhone merchants.
            </p>
            <button
              onClick={() => {
                setSelectedCity("all");
                setSearchQuery("");
              }}
              className="btn btn-outline btn-sm rounded-xl font-bold mt-2"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Merchant Onboarding CTA */}
        <div className="bg-primary/10 rounded-3xl border border-primary/20 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="badge badge-primary badge-sm font-extrabold uppercase tracking-wider">
              For Phone Dealers & Merchants
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-base-content tracking-tight">
              Do you operate a phone store in Nigeria?
            </h2>
            <p className="text-xs sm:text-sm text-base-content/75 max-w-xl">
              Get certified on Swappy to showcase your inventory to thousands of
              ready buyers, manage swap requests, and build dealer credibility.
            </p>
          </div>

          <Link
            to="/app/auth/signup"
            className="btn btn-primary rounded-2xl font-black px-6 shadow-md whitespace-nowrap"
          >
            <span>Register as Verified Merchant</span>
          </Link>
        </div>

        {/* Safety Protocol */}
        <SafetyAlert />
      </main>

      <Footer />
    </div>
  );
}
