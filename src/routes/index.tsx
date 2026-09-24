import { createFileRoute } from "@tanstack/react-router";
import { getHomepageDataFn } from "../server/listings";
import { PublicNavbar } from "../components/layout/PublicNavbar";
import { HeroSection } from "../components/home/HeroSection";
import { PromotedCarousel } from "../components/home/PromotedCarousel";
import { FreshDealsSection } from "../components/home/FreshDealsSection";
import { TradeFeatureSection } from "../components/home/TradeFeatureSection";
import { Footer } from "../components/layout/Footer";

export const Route = createFileRoute("/")({
  loader: async () => await getHomepageDataFn(),
  component: HomePage,
});

function HomePage() {
  const { promoted, recent } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-base-100 text-base-content flex flex-col antialiased">
      <PublicNavbar />
      <main className="flex-1">
        <HeroSection />
        {promoted && promoted.length > 0 && (
          <PromotedCarousel listings={promoted} />
        )}
        <FreshDealsSection listings={recent || []} />
        <TradeFeatureSection />
      </main>
      <Footer />
    </div>
  );
}
