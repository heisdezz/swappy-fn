import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  Compass,
  LayoutDashboard,
  LogOut,
  Moon,
  Plus,
  ShieldCheck,
  Sun,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { pb } from "../../client/pb";

export function PublicNavbar() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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

    // Track authentication state
    setIsAuthenticated(pb.authStore.isValid);
    const unsubscribe = pb.authStore.onChange(() => {
      setIsAuthenticated(pb.authStore.isValid);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("swappy-theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  const handleSignOut = () => {
    pb.authStore.clear();
    setIsAuthenticated(false);
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 bg-base-100/90 backdrop-blur border-b border-base-200">
      <div className="container mx-auto px-4">
        <div className="navbar min-h-16 px-0 gap-3">
          {/* Brand */}
          <div className="flex-1 flex items-center gap-2">
            <Link
              to="/"
              className="flex items-center gap-2 text-xl font-black tracking-tight"
            >
              <span className="w-9 h-9 rounded-xl bg-primary text-primary-content flex items-center justify-center font-black shadow-sm">
                <ArrowLeftRight className="w-5 h-5 stroke-[2.5]" />
              </span>
              <span className="text-xl font-extrabold tracking-tight">
                swappy<span className="text-primary font-black">.</span>
              </span>
            </Link>

            <span className="hidden md:inline-flex badge badge-sm badge-neutral font-medium">
              iPhone Marketplace
            </span>
          </div>

          {/* Quick Nav Links */}
          <nav className="flex items-center gap-1">
            <Link
              to="/explore"
              activeProps={{ className: "btn-active font-bold text-primary" }}
              className="btn btn-ghost btn-sm text-sm font-semibold rounded-lg inline-flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4 text-primary" />
              <span>Explore</span>
            </Link>
            <Link
              to="/stores"
              activeProps={{ className: "btn-active font-bold text-accent" }}
              className="btn btn-ghost btn-sm text-sm font-semibold rounded-lg hidden sm:inline-flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-accent" />
              <span>Verified Stores</span>
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle visual theme"
              className="btn btn-ghost btn-circle btn-sm"
              title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4 text-base-content/80" />
              ) : (
                <Sun className="w-4 h-4 text-primary" />
              )}
            </button>

            {/* Post Listing CTA */}
            <Link
              to={
                isAuthenticated
                  ? ("/dashboard" as string)
                  : ("/app/auth/login?redirect=/dashboard" as string)
              }
              className="btn btn-primary btn-sm rounded-xl font-bold inline-flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden xs:inline">Post Listing</span>
            </Link>

            {/* Auth Dropdown or Sign In */}
            {isAuthenticated ? (
              <div className="dropdown dropdown-end">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-ghost btn-circle btn-sm bg-base-200"
                >
                  <User className="w-4 h-4" />
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu menu-sm bg-base-100 rounded-2xl z-50 w-52 p-2 shadow-xl border border-base-300 mt-2 space-y-1"
                >
                  <li>
                    <Link
                      to={"/dashboard" as string}
                      className="font-bold inline-flex items-center gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4 text-primary" />
                      <span>Dashboard</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/stores"
                      className="inline-flex items-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4 text-accent" />
                      <span>Verified Stores</span>
                    </Link>
                  </li>
                  <div className="divider my-1" />
                  <li>
                    <button
                      onClick={handleSignOut}
                      className="text-error font-semibold inline-flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <Link
                to={"/app/auth/login" as string}
                className="btn btn-ghost btn-sm text-sm font-semibold rounded-xl"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
