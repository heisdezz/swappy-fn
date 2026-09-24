import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BatteryCharging,
  ExternalLink,
  Lock,
  Pencil,
  Plus,
  Smartphone,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { pb } from "../../../client/pb";
import { DashboardLayout } from "../../../components/dashboard/DashboardLayout";
import type { ItemCardRecord } from "../../../components/items/ItemCard";
import SearchBar from "../../../components/SearchBar";
import PageLoader from "../../../components/wrappers/PageLoader";
import { extract_message } from "../../../helpers/api";
import { getItemCardImageUrl } from "../../../helpers/images";
import { createItemSlug } from "../../../utils/slug";

export const Route = createFileRoute("/dashboard/phones/")({
  ssr: false,
  component: MyPhonesPage,
});

function MyPhonesPage() {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<
    "all" | "active" | "sold" | "paused"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(pb.authStore.isValid);

  useEffect(() => {
    setIsAuthenticated(pb.authStore.isValid);
    const unsub = pb.authStore.onChange(() => {
      setIsAuthenticated(pb.authStore.isValid);
    });
    return () => unsub();
  }, []);

  const userId = pb.authStore.record?.id;

  const phonesQuery = useQuery({
    queryKey: ["my-phones", userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return [];

      // Check if user owns a store so their store listings are also included
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

      const res = await pb.collection("items").getList(1, 50, {
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
        created: item.created ? String(item.created) : undefined,
      }));

      return sanitized;
    },
  });

  const handleDelete = async (id: string, title?: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${title || "this iPhone listing"}?`,
    );
    if (!confirmed) return;

    try {
      await pb.collection("items").delete(id);
      queryClient.invalidateQueries({ queryKey: ["my-phones"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
    } catch (err) {
      alert(extract_message(err));
      console.error(err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-base-200/50 flex items-center justify-center p-4">
        <div className="bg-base-100 rounded-3xl border border-base-300 p-8 sm:p-10 max-w-md w-full text-center space-y-5 shadow-xl">
          <div className="w-16 h-16 rounded-3xl bg-primary/20 text-primary-content flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8 text-primary" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-base-content tracking-tight">
              Seller Authentication Required
            </h1>
            <p className="text-xs sm:text-sm text-base-content/70">
              Please sign in to view and manage your uploaded iPhone listings.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              to={"/app/auth/login?redirect=/dashboard/phones" as string}
              className="btn btn-primary rounded-2xl font-black w-full shadow-md text-sm"
            >
              Sign In
            </Link>
            <Link
              to="/"
              className="btn btn-ghost rounded-2xl font-bold w-full text-xs text-base-content/70"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout activeTab="listings">
      <PageLoader query={phonesQuery}>
        {(items) => (
          <MyPhonesList
            items={items}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            onDelete={handleDelete}
          />
        )}
      </PageLoader>
    </DashboardLayout>
  );
}

interface MyPhonesListProps {
  items: ItemCardRecord[];
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  activeFilter: "all" | "active" | "sold" | "paused";
  setActiveFilter: (v: "all" | "active" | "sold" | "paused") => void;
  onDelete: (id: string, title?: string) => void;
}

function MyPhonesList({
  items,
  searchQuery,
  setSearchQuery,
  activeFilter,
  setActiveFilter,
  onDelete,
}: MyPhonesListProps) {
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.storage && item.storage.toLowerCase().includes(q)) ||
        (item.color && item.color.toLowerCase().includes(q)) ||
        (item.location_city && item.location_city.toLowerCase().includes(q));

      return matchesSearch;
    });
  }, [items, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-base-content tracking-tight flex items-center gap-2.5">
            <span>My iPhones</span>
            <span className="badge badge-primary badge-sm font-bold">
              {items.length}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70 mt-1">
            Manage your smartphone inventory, price adjustments, and swap
            preferences.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/dashboard/phones/new"
            className="btn btn-primary btn-sm rounded-xl font-bold inline-flex items-center gap-1.5 shadow-sm text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Post New iPhone</span>
          </Link>
        </div>
      </div>

      {/* Filter Bar & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-base-100 p-3.5 rounded-2xl border border-base-300 shadow-xs">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All iPhones" },
            { id: "active", label: "Active" },
            { id: "sold", label: "Sold" },
            { id: "paused", label: "Paused" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                setActiveFilter(tab.id as "all" | "active" | "sold" | "paused")
              }
              className={`btn btn-xs rounded-xl font-bold ${
                activeFilter === tab.id
                  ? "btn-primary shadow-xs"
                  : "btn-ghost text-base-content/70"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Enhanced SearchBar Component */}
        <div className="w-full sm:w-72">
          <SearchBar
            value={searchQuery}
            onChange={(val) => setSearchQuery(val)}
            onClear={() => setSearchQuery("")}
            navigateOnSubmit={false}
            placeholder="Search my phones..."
            className="w-full max-w-full"
          />
        </div>
      </div>

      {/* Items List / Table */}
      {filteredItems.length > 0 ? (
        <div className="bg-base-100 rounded-3xl border border-base-300 overflow-hidden shadow-xs divide-y divide-base-200">
          {filteredItems.map((item) => {
            const formattedPrice = item.price
              ? new Intl.NumberFormat("en-NG", {
                  style: "currency",
                  currency: "NGN",
                  maximumFractionDigits: 0,
                }).format(item.price)
              : "Price on request";

            const itemSlug = createItemSlug(item);
            const imageUrl = getItemCardImageUrl(item, "200x200");

            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-base-200/40 transition-colors"
              >
                {/* Item Details */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-16 h-16 rounded-2xl bg-base-200 p-1.5 border border-base-300/60 shrink-0 flex items-center justify-center overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={item.title || "iPhone"}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.src.includes("/iphone_")) {
                          target.src = "/iphone_1.png";
                        }
                      }}
                    />
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        to={"/dashboard/phones/$id" as string}
                        params={{ id: item.id }}
                        className="font-extrabold text-sm sm:text-base text-base-content hover:text-primary transition-colors truncate max-w-xs sm:max-w-md"
                      >
                        {item.title}
                      </Link>
                      {item.accepts_swap && (
                        <span className="badge badge-secondary badge-xs font-bold">
                          Swap OK
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-base-content/70 flex-wrap">
                      <span className="font-black text-primary text-sm font-mono">
                        {formattedPrice}
                      </span>
                      <span>&bull;</span>
                      <span className="badge badge-ghost badge-xs font-semibold">
                        {item.storage || "128GB"}
                      </span>
                      {item.battery_health && (
                        <>
                          <span>&bull;</span>
                          <span className="inline-flex items-center gap-1 font-semibold text-success">
                            <BatteryCharging className="w-3.5 h-3.5" />
                            <span>{item.battery_health}%</span>
                          </span>
                        </>
                      )}
                      <span>&bull;</span>
                      <span>
                        {item.location_city || "Ikeja"},{" "}
                        {item.location_state || "Lagos"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Row Actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <Link
                    to={"/items/$slug" as string}
                    params={{ slug: itemSlug }}
                    className="btn btn-ghost btn-sm rounded-xl text-base-content/70 hover:text-primary"
                    title="View public listing"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="hidden md:inline text-xs">Preview</span>
                  </Link>

                  <Link
                    to={"/dashboard/phones/$id" as string}
                    params={{ id: item.id }}
                    className="btn btn-neutral btn-sm rounded-xl font-bold inline-flex items-center gap-1.5 text-xs"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </Link>

                  <button
                    onClick={() => onDelete(item.id, item.title)}
                    className="btn btn-ghost btn-sm btn-square rounded-xl text-error hover:bg-error/15"
                    title="Delete listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-base-100 rounded-3xl border border-base-300 p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Smartphone className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-lg text-base-content">
              No iPhone listings found
            </h3>
            <p className="text-xs sm:text-sm text-base-content/60 max-w-sm mx-auto">
              You haven't posted any iPhones matching this filter yet. Create
              your first verified listing now.
            </p>
          </div>
          <Link
            to="/dashboard/phones/new"
            className="btn btn-primary rounded-2xl font-bold text-xs sm:text-sm px-6 shadow-sm"
          >
            Post New iPhone
          </Link>
        </div>
      )}
    </div>
  );
}
