import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  ExternalLink,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Plus,
  Settings,
  Smartphone,
  Store,
  Sun,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { pb } from "../../client/pb";
import { useWatchlist } from "../../helpers/watchlist";

export interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab?:
    | "overview"
    | "phones"
    | "listings"
    | "stores"
    | "store"
    | "messages"
    | "swaps"
    | "saved"
    | "settings";
}

export function DashboardLayout({
  children,
  activeTab = "overview",
}: DashboardLayoutProps) {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const { count } = useWatchlist();

  // Keep theme state aligned
  useEffect(() => {
    const savedTheme =
      (localStorage.getItem("theme") as "light" | "dark") || "dark";
    setTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    const controller = document.querySelector(
      'input.theme-controller[value="' + nextTheme + '"]',
    ) as HTMLInputElement | null;
    if (controller) controller.checked = true;
  };

  // Auth check & user data
  const currentUser = pb.authStore.record;

  const handleSignOut = () => {
    pb.authStore.clear();
    navigate({ to: "/" });
  };

  // Query unread message counts
  const unreadMessagesQuery = useQuery({
    queryKey: ["dashboard-unread-messages", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return 0;
      try {
        const rooms = await pb.collection("chatrooms").getList(1, 50, {
          filter: `buyer = "${currentUser.id}" || seller = "${currentUser.id}"`,
          requestKey: null,
        });

        let totalUnread = 0;
        rooms.items.forEach((room: any) => {
          if (room.buyer === currentUser.id) {
            totalUnread += room.unread_count_buyer || 0;
          } else if (room.seller === currentUser.id) {
            totalUnread += room.unread_count_seller || 0;
          }
        });
        return totalUnread;
      } catch {
        return 0;
      }
    },
    enabled: !!currentUser?.id,
    refetchInterval: 15000,
  });

  const unreadCount = unreadMessagesQuery.data || 0;

  // Query active inventory count
  const listingsCountQuery = useQuery({
    queryKey: ["dashboard-listings-count", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return 0;
      try {
        const res = await pb.collection("items").getList(1, 1, {
          filter: `seller = "${currentUser.id}"`,
          requestKey: null,
        });
        return res.totalItems;
      } catch {
        return 0;
      }
    },
    enabled: !!currentUser?.id,
  });

  const totalListings = listingsCountQuery.data || 0;

  const isTabActive = (tabId: string) => {
    if (activeTab === tabId) return true;
    if (
      (tabId === "phones" && activeTab === "listings") ||
      (tabId === "listings" && activeTab === "phones")
    )
      return true;
    if (
      (tabId === "stores" && activeTab === "store") ||
      (tabId === "store" && activeTab === "stores")
    )
      return true;
    return false;
  };

  const navItems = [
    {
      id: "overview",
      label: "Control Center",
      icon: LayoutDashboard,
      to: "/dashboard",
    },
    {
      id: "phones",
      label: "My Inventory",
      icon: Smartphone,
      to: "/dashboard/phones",
      badge: totalListings > 0 ? String(totalListings) : undefined,
    },
    {
      id: "stores",
      label: "Store Profile",
      icon: Store,
      to: "/dashboard/stores",
      badge: "Verified",
      badgeColor: "badge-success text-success-content",
    },
    {
      id: "messages",
      label: "Messages",
      icon: MessageSquare,
      to: "/dashboard/messages",
      badge: unreadCount > 0 ? `${unreadCount} new` : undefined,
      badgeColor: "badge-primary text-primary-content animate-pulse",
    },
    {
      id: "swaps",
      label: "Swap Proposals",
      icon: ArrowLeftRight,
      to: "/dashboard/swaps",
    },
    {
      id: "saved",
      label: "Saved iPhones",
      icon: Heart,
      to: "/dashboard/saved",
      badge: count > 0 ? String(count) : undefined,
    },
    {
      id: "settings",
      label: "Account Settings",
      icon: Settings,
      to: "/dashboard/settings",
    },
  ];

  return (
    <div className="drawer lg:drawer-open h-screen h-dvh bg-base-200/40 text-base-content antialiased overflow-hidden">
      <input
        id="dashboard-sidebar-drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={isMobileMenuOpen}
        onChange={(e) => setIsMobileMenuOpen(e.target.checked)}
      />

      {/* Main Content Area */}
      <div className="drawer-content flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Navbar */}
        <header className="h-18 shrink-0 bg-base-100 border-b border-base-300 px-4 sm:px-8 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <label
              htmlFor="dashboard-sidebar-drawer"
              className="btn btn-ghost btn-circle btn-sm lg:hidden drawer-button cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </label>

            <Link
              to="/"
              className="lg:hidden flex items-center gap-2 text-base font-black"
            >
              <span className="w-7 h-7 rounded-lg bg-primary text-primary-content flex items-center justify-center font-black">
                <ArrowLeftRight className="w-4 h-4" />
              </span>
              <span>swappy</span>
            </Link>

            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-base-content/50">
              <span>Marketplace Status</span>
              <span className="inline-block w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-success font-mono text-[11px]">Online</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/explore"
              className="btn btn-ghost btn-sm rounded-xl font-bold text-xs inline-flex items-center gap-1.5 hidden sm:inline-flex"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Browse Catalog</span>
            </Link>

            <Link
              to="/dashboard/phones/new"
              className="btn btn-primary btn-sm rounded-xl font-black text-xs inline-flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Post New iPhone</span>
            </Link>
          </div>
        </header>

        {/* Body Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto w-full">{children}</div>
        </main>
      </div>

      {/* DaisyUI Drawer Side */}
      <div className="drawer-side z-40">
        <label
          htmlFor="dashboard-sidebar-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <aside className="w-72 bg-base-100 border-r border-base-300 flex flex-col min-h-full h-full shadow-2xl lg:shadow-none">
          {/* Brand */}
          <div className="h-18 shrink-0 flex items-center px-6 border-b border-base-200 justify-between">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3"
            >
              <span className="w-9 h-9 rounded-xl bg-primary text-primary-content flex items-center justify-center font-black shadow-sm">
                <ArrowLeftRight className="w-4.5 h-4.5 stroke-[2.5]" />
              </span>
              <span className="text-xl font-extrabold tracking-tight">
                swappy<span className="text-primary font-black">.</span>
              </span>
            </Link>

            <div className="flex items-center gap-1">
              <span className="badge badge-accent badge-xs font-bold px-2 py-0.5 text-[10px]">
                Seller Hub
              </span>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn btn-ghost btn-circle btn-xs lg:hidden cursor-pointer"
                aria-label="Close sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sidebar Nav Items */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 min-h-0">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-base-content/50 px-3 pb-2">
              Operations & Deals
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isTabActive(item.id);
              return (
                <Link
                  key={item.id}
                  to={item.to as string}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                    active
                      ? "bg-primary text-primary-content shadow-sm"
                      : "text-base-content/75 hover:bg-base-200/80 hover:text-base-content"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        active ? "text-primary-content" : "text-base-content/60"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`badge badge-xs font-bold px-2 py-0.5 text-[10px] ${
                        item.badgeColor
                          ? item.badgeColor
                          : active
                            ? "badge-neutral text-neutral-content"
                            : "badge-ghost text-base-content/70"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* User Card & Controls at Bottom */}
          <div className="p-4 border-t border-base-200 bg-base-100/50 space-y-3 shrink-0">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-semibold text-base-content/60">
                Theme mode
              </span>
              <button
                onClick={toggleTheme}
                aria-label="Toggle visual theme"
                className="btn btn-ghost btn-circle btn-xs cursor-pointer"
                title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
              >
                {theme === "light" ? (
                  <Moon className="w-3.5 h-3.5 text-base-content/80" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-primary" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between p-2 rounded-2xl bg-base-200/50 border border-base-300/60">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold text-xs uppercase shrink-0">
                  {currentUser?.name?.slice(0, 2) ||
                    currentUser?.email?.slice(0, 2) ||
                    "SW"}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-base-content truncate">
                    {currentUser?.name ||
                      currentUser?.username ||
                      "Verified User"}
                  </div>
                  <div className="text-[10px] text-base-content/50 truncate">
                    {currentUser?.email || "swappy@dealer.ng"}
                  </div>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="btn btn-ghost btn-circle btn-xs text-error/80 hover:text-error hover:bg-error/10 cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
