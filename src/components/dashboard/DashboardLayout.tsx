import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
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
  activeTab?: "overview" | "listings" | "swaps" | "store" | "settings";
}

export function DashboardLayout({
  children,
  activeTab = "overview",
}: DashboardLayoutProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(pb.authStore.record);
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
        <div className="flex-1 overflow-y-auto py-7 px-5 space-y-6">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <Link
                  key={item.id}
                  to={item.to as string}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all ${
                    isActive
                      ? "bg-primary text-primary-content shadow-sm"
                      : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon className="w-4.5 h-4.5 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`badge badge-xs font-bold text-[10px] px-2 py-0.5 ${
                        isActive
                          ? "bg-primary-content/20 text-primary-content border-transparent"
                          : "badge-neutral"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Quick Post Button */}
          <div className="pt-2">
            <Link
              to="/dashboard/phones/new"
              className="btn btn-primary w-full h-11 rounded-2xl font-black text-xs sm:text-sm inline-flex items-center justify-center gap-2 shadow-sm"
            >
              <Plus className="w-4.5 h-4.5 stroke-[3]" />
              <span>Post New iPhone</span>
            </Link>
          </div>

          {/* Marketplace Shortcut */}
          <div className="pt-6 border-t border-base-200">
            <div className="text-[11px] font-bold text-base-content/50 uppercase tracking-wider px-3.5 mb-3">
              Explore
            </div>
            <Link
              to="/explore"
              className="flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold text-base-content/70 hover:bg-base-200 hover:text-base-content transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <ExternalLink className="w-4.5 h-4.5 text-base-content/50" />
                <span>Visit Marketplace</span>
              </div>
            </Link>
          </div>
        </div>

        {/* User Card & Sign Out */}
        <div className="p-5 border-t border-base-200 shrink-0">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-base-200/60 border border-base-300/50">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-black text-sm shrink-0">
                {currentUser?.name
                  ? String(currentUser.name).charAt(0).toUpperCase()
                  : "U"}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-base-content truncate">
                  {currentUser?.name || currentUser?.email || "Seller Account"}
                </div>
                <div className="text-[10px] text-base-content/60 truncate">
                  {currentUser?.email || "Active Trader"}
                </div>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              aria-label="Sign Out"
              title="Sign Out"
              className="btn btn-ghost btn-xs btn-circle text-error hover:bg-error/15"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 shrink-0 bg-base-100 border-b border-base-300 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
          {/* Mobile Menu Button & Brand */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="btn btn-ghost btn-sm btn-circle"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
            <Link to="/" className="flex items-center gap-2 font-black text-lg">
              <span className="w-8 h-8 rounded-lg bg-primary text-primary-content flex items-center justify-center font-black text-xs">
                <ArrowLeftRight className="w-4 h-4" />
              </span>
              <span>swappy</span>
            </Link>
          </div>

          {/* Page Indicator */}
          <div className="hidden lg:flex items-center gap-2.5 text-xs font-semibold text-base-content/60">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-base-content font-bold capitalize">
              {activeTab}
            </span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="btn btn-ghost btn-circle btn-sm"
              aria-label="Toggle theme"
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4 text-base-content/80" />
              ) : (
                <Sun className="w-4 h-4 text-primary" />
              )}
            </button>

            {/* Quick Post Action - Now links directly to /dashboard/phones/new */}
            <Link
              to="/dashboard/phones/new"
              className="btn btn-primary btn-sm h-10 px-4 rounded-xl font-bold inline-flex items-center gap-2 shadow-sm text-xs sm:text-sm"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Post iPhone</span>
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex">
            <div className="w-80 bg-base-100 h-full p-5 flex flex-col justify-between shadow-2xl">
              <div>
                <div className="flex items-center justify-between pb-5 border-b border-base-200 mb-5">
                  <div className="flex items-center gap-2.5 font-black text-lg">
                    <span className="w-8 h-8 rounded-xl bg-primary text-primary-content flex items-center justify-center font-black">
                      <ArrowLeftRight className="w-4 h-4" />
                    </span>
                    <span>swappy</span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="btn btn-ghost btn-sm btn-circle"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <Link
                        key={item.id}
                        to={item.to as string}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm ${
                          isActive
                            ? "bg-primary text-primary-content"
                            : "text-base-content/70 hover:bg-base-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="badge badge-neutral badge-xs font-bold">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>

                <div className="pt-4">
                  <Link
                    to="/dashboard/phones/new"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="btn btn-primary w-full h-11 rounded-2xl font-black text-xs sm:text-sm inline-flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4.5 h-4.5 stroke-[3]" />
                    <span>Post New iPhone</span>
                  </Link>
                </div>
              </div>

              <div className="pt-4 border-t border-base-200 space-y-3">
                <Link
                  to="/explore"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-xs font-bold text-base-content/70 hover:text-primary"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Marketplace Explore</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="btn btn-outline btn-error btn-sm w-full rounded-xl text-xs font-bold"
                >
                  Sign Out
                </button>
              </div>
            </div>
            <div
              className="flex-1"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          </div>
        )}

        {/* Scrollable Dashboard Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="w-full space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
