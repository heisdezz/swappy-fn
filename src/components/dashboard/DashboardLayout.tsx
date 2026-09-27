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
  RefreshCw,
  Settings,
  ShieldCheck,
  Smartphone,
  Sun,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { pb } from "../../client/pb";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab?:
    | "overview"
    | "listings"
    | "swaps"
    | "messages"
    | "store"
    | "saved"
    | "settings";
}

export function DashboardLayout({
  children,
  activeTab = "overview",
}: DashboardLayoutProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(pb.authStore.record);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem("swappy-theme") as
      "light" | "dark" | null;
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const activeTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
    setTheme(activeTheme);
    document.documentElement.setAttribute("data-theme", activeTheme);

    setCurrentUser(pb.authStore.record);
    const unsub = pb.authStore.onChange(() => {
      setCurrentUser(pb.authStore.record);
    });
    return () => unsub();
  }, []);

  // Fetch unread messages count for logged-in user
  useEffect(() => {
    const userId = pb.authStore.record?.id;
    if (!userId) return;

    const checkUnread = async () => {
      try {
        const res = await pb.collection("messages").getList(1, 1, {
          filter: `recipient = "${userId}" && read = false`,
          requestKey: null,
        });
        setUnreadCount(res.totalItems);
      } catch {
        // quiet ignore
      }
    };

    checkUnread();

    // Subscribe to incoming messages
    const unsubPromise = pb.collection("messages").subscribe("*", (e) => {
      if (e.record.recipient === userId) {
        checkUnread();
      }
    });

    return () => {
      unsubPromise.then((unsub) => unsub()).catch(() => {});
    };
  }, [currentUser]);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("swappy-theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  const handleSignOut = () => {
    pb.authStore.clear();
    navigate({ to: "/" });
  };

  const navItems = [
    {
      id: "overview",
      label: "Dashboard",
      icon: LayoutDashboard,
      to: "/dashboard",
    },
    {
      id: "listings",
      label: "My iPhones",
      icon: Smartphone,
      to: "/dashboard/phones",
      badge: "Manage",
    },
    {
      id: "messages",
      label: "Chat Messages",
      icon: MessageSquare,
      to: "/dashboard/messages",
      badge: unreadCount > 0 ? `${unreadCount} new` : undefined,
      badgeColor: unreadCount > 0 ? "badge-primary" : undefined,
    },
    {
      id: "swaps",
      label: "Swap Offers",
      icon: RefreshCw,
      to: "/dashboard",
      badge: "Live",
    },
    {
      id: "store",
      label: "Store Hub",
      icon: ShieldCheck,
      to: "/dashboard/stores",
    },
    {
      id: "saved",
      label: "Saved iPhones",
      icon: Heart,
      to: "/dashboard/saved",
      badge: "Watchlist",
    },
    {
      id: "settings",
      label: "Account Settings",
      icon: Settings,
      to: "/dashboard/settings",
    },
  ];

  return (
    <div className="h-screen h-dvh bg-base-200/40 text-base-content flex antialiased overflow-hidden">
      {/* Desktop Sidebar (Generous spacing, fixed height) */}
      <aside className="hidden lg:flex w-72 flex-col bg-base-100 border-r border-base-300 z-30 shrink-0 h-full">
        {/* Brand */}
        <div className="h-18 shrink-0 flex items-center px-6 border-b border-base-200 justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-primary text-primary-content flex items-center justify-center font-black shadow-sm">
              <ArrowLeftRight className="w-4.5 h-4.5 stroke-[2.5]" />
            </span>
            <span className="text-xl font-extrabold tracking-tight">
              swappy<span className="text-primary font-black">.</span>
            </span>
          </Link>

          <span className="badge badge-accent badge-xs font-bold px-2 py-0.5 text-[10px]">
            Seller Hub
          </span>
        </div>

        {/* Sidebar Nav Items (Scrollable without growing sidebar height) */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 min-h-0">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-base-content/50 px-3 pb-2">
            Operations & Deals
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <Link
                key={item.id}
                to={item.to as string}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                  isActive
                    ? "bg-primary text-primary-content shadow-sm"
                    : "text-base-content/75 hover:bg-base-200/80 hover:text-base-content"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? "text-primary-content" : "text-base-content/60"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`badge badge-xs font-bold px-2 py-0.5 text-[10px] ${
                      item.badgeColor
                        ? item.badgeColor
                        : isActive
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
              className="btn btn-ghost btn-circle btn-xs"
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
              className="btn btn-ghost btn-circle btn-xs text-error/80 hover:text-error hover:bg-error/10"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Navbar */}
        <header className="h-18 shrink-0 bg-base-100 border-b border-base-300 px-4 sm:px-8 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="btn btn-ghost btn-circle btn-sm lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

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

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="relative w-72 max-w-[80vw] bg-base-100 flex flex-col h-full shadow-2xl z-10">
            <div className="h-16 flex items-center justify-between px-6 border-b border-base-200">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2.5 text-lg font-black"
              >
                <span className="w-8 h-8 rounded-lg bg-primary text-primary-content flex items-center justify-center font-black">
                  <ArrowLeftRight className="w-4 h-4" />
                </span>
                <span>swappy</span>
              </Link>

              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn btn-ghost btn-circle btn-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <Link
                    key={item.id}
                    to={item.to as string}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-primary text-primary-content shadow-sm"
                        : "text-base-content/75 hover:bg-base-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="badge badge-neutral badge-xs font-bold px-2 py-0.5 text-[10px]">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="p-4 border-t border-base-200">
              <button
                onClick={handleSignOut}
                className="btn btn-outline btn-error btn-sm rounded-xl w-full font-bold text-xs"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
