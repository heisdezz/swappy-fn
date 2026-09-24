import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Lock, Plus, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { pb } from "../../client/pb";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { DashboardRecentListings } from "../../components/dashboard/DashboardRecentListings";
import { DashboardStats } from "../../components/dashboard/DashboardStats";
import {
  DashboardSwapRequests,
  type SwapRequestItem,
} from "../../components/dashboard/DashboardSwapRequests";
import type { ItemCardRecord } from "../../components/items/ItemCard";
import PageLoader from "../../components/wrappers/PageLoader";

export const Route = createFileRoute("/dashboard/")({
  ssr: false,
  component: DashboardPage,
});

interface DashboardData {
  listings: ItemCardRecord[];
  swapRequests: SwapRequestItem[];
  analytics: {
    totalViews: number;
    totalCopied: number;
  };
}

function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(pb.authStore.isValid);
  const queryClient = useQueryClient();

  useEffect(() => {
    setIsAuthenticated(pb.authStore.isValid);
    const unsub = pb.authStore.onChange(() => {
      setIsAuthenticated(pb.authStore.isValid);
    });
    return () => unsub();
  }, []);

  const userId = pb.authStore.record?.id;

  const dashboardQuery = useQuery<DashboardData>({
    queryKey: ["dashboard-data", userId],
    enabled: isAuthenticated && !!userId,
    queryFn: async () => {
      if (!userId) {
        return {
          listings: [],
          swapRequests: [],
          analytics: { totalViews: 0, totalCopied: 0 },
        };
      }

      // Check if user has an associated store
      let storeFilter = "";
      try {
        const storeRes = await pb.collection("store").getList(1, 1, {
          filter: `owner = "${userId}"`,
          requestKey: null,
        });
        if (storeRes.items.length > 0) {
          storeFilter = ` || store = "${storeRes.items[0].id}"`;
        }
      } catch (err) {
        console.warn("Could not query user store:", err);
      }

      // 1. Fetch user's listings
      const res = await pb.collection("items").getList(1, 10, {
        filter: `seller = "${userId}"${storeFilter}`,
        sort: "-created",
        requestKey: null,
      });

      const sanitized: ItemCardRecord[] = (res.items || []).map((item) => ({
        id: String(item.id),
        collectionId: String(item.collectionId || "items"),
        collectionName: String(item.collectionName || "items"),
        title: item.title ? String(item.title) : "iPhone",
        price: typeof item.price === "number" ? item.price : 450000,
        storage: item.storage ? String(item.storage) : "128GB",
        color: item.color ? String(item.color) : "Natural Titanium",
        battery_health:
          typeof item.battery_health === "number" ? item.battery_health : 92,
        condition: item.condition ? String(item.condition) : "flawless",
        carrier_status: item.carrier_status
          ? String(item.carrier_status)
          : "factory_unlocked",
        accepts_swap:
          typeof item.accepts_swap === "boolean" ? item.accepts_swap : true,
        location_city: item.location_city
          ? String(item.location_city)
          : "Ikeja",
        location_state: item.location_state
          ? String(item.location_state)
          : "Lagos",
        images:
          Array.isArray(item.images) && item.images.length > 0
            ? (item.images as string[])
            : [],
      }));

      // 2. Fetch live swap offers for seller's devices
      let swapRequests: SwapRequestItem[] = [];
      try {
        const swapRes = await pb.collection("swap_offers").getList(1, 20, {
          filter: `seller = "${userId}"`,
          sort: "-id",
          expand: "target_item,proposer",
          requestKey: null,
        });

        swapRequests = (swapRes.items || []).map((s) => {
          const raw = s as unknown as Record<string, any>;
          const expand = (raw.expand || {}) as Record<string, any>;
          const target = expand.target_item;
          const proposer = expand.proposer;

          return {
            id: String(raw.id),
            target_device_id: String(raw.target_item || ""),
            target_device_title: target?.title
              ? String(target.title)
              : "iPhone",
            offered_model: raw.offered_model
              ? String(raw.offered_model)
              : "iPhone",
            offered_storage: raw.offered_storage
              ? String(raw.offered_storage)
              : "128GB",
            offered_battery:
              typeof raw.offered_battery === "number"
                ? raw.offered_battery
                : undefined,
            offered_condition: raw.offered_condition
              ? String(raw.offered_condition)
              : undefined,
            cash_adjustment:
              typeof raw.cash_adjustment === "number" ? raw.cash_adjustment : 0,
            buyer_name:
              proposer?.name ||
              proposer?.email?.split("@")[0] ||
              "Prospective Buyer",
            buyer_whatsapp: proposer?.phone || undefined,
            status: (raw.status as any) || "pending",
            message: raw.message ? String(raw.message) : undefined,
            created: String(raw.created || ""),
          };
        });
      } catch (err) {
        console.warn("Could not query swap_offers:", err);
      }

      // 3. Aggregate real analytics for user's devices
      let totalViews = 0;
      let totalCopied = 0;

      if (res.items.length > 0) {
        try {
          const itemIds = res.items.map((i) => `item = "${i.id}"`).join(" || ");
          const analyticsRes = await pb.collection("analytics").getList(1, 50, {
            filter: itemIds,
            requestKey: null,
          });

          for (const a of analyticsRes.items) {
            totalViews += Number(a.views_count || 0);
            totalCopied += Number(a.copied_count || 0);
          }
        } catch (e) {
          console.warn("Could not aggregate analytics:", e);
        }
      }

      return {
        listings: sanitized,
        swapRequests,
        analytics: {
          totalViews,
          totalCopied,
        },
      };
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-base-200/50 flex items-center justify-center p-4">
        <div className="bg-base-100 rounded-3xl border border-base-300 p-8 sm:p-10 max-w-md w-full text-center space-y-5 shadow-xl">
          <div className="w-16 h-16 rounded-3xl bg-primary/20 text-primary-content flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8 text-primary" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-base-content tracking-tight">
              Seller Dashboard Access
            </h1>
            <p className="text-xs sm:text-sm text-base-content/70">
              Please sign in with your verified Swappy account to manage your
              iPhone inventory, respond to swap proposals, and track buyer
              leads.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              to={"/app/auth/login?redirect=/dashboard" as string}
              className="btn btn-primary rounded-2xl font-black w-full shadow-md text-sm"
            >
              <span>Sign In to Dashboard</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              to="/"
              className="btn btn-ghost rounded-2xl font-bold w-full text-xs text-base-content/70"
            >
              Return to Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout activeTab="overview">
      <PageLoader query={dashboardQuery}>
        {(data) => {
          const { listings, swapRequests, analytics } = data;
          return (
            <div className="space-y-8">
              {/* Welcome Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-base-content tracking-tight">
                    Seller Overview
                  </h1>
                  <p className="text-xs sm:text-sm text-base-content/70 mt-1">
                    Monitor live iPhone listings, incoming swap offers, and
                    buyer inquiries.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to="/stores"
                    className="btn btn-ghost btn-sm rounded-xl font-bold text-xs inline-flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4 text-accent" />
                    <span>Verified Hub</span>
                  </Link>
                  <Link
                    to="/dashboard/phones/new"
                    className="btn btn-primary btn-sm rounded-xl font-bold inline-flex items-center gap-1.5 shadow-sm text-xs"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Post iPhone</span>
                  </Link>
                </div>
              </div>

              {/* Metric Stats with real views and contact copies */}
              <DashboardStats
                activeListingsCount={listings.length}
                totalViews={analytics.totalViews}
                pendingSwapsCount={
                  swapRequests.filter((r) => r.status === "pending").length
                }
                whatsappLeadsCount={analytics.totalCopied}
              />

              {/* Main Grid: Listings (2 cols) & Swap Negotiations (1 col) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <DashboardRecentListings listings={listings} />
                </div>

                <div className="lg:col-span-1">
                  <DashboardSwapRequests
                    requests={swapRequests}
                    onRefresh={() =>
                      queryClient.invalidateQueries({
                        queryKey: ["dashboard-data"],
                      })
                    }
                  />
                </div>
              </div>
            </div>
          );
        }}
      </PageLoader>
    </DashboardLayout>
  );
}
