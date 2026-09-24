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
      <div className="container mx-auto px-4 sm:px-6">
        <div className="navbar min-h-18 px-0 gap-4 sm:gap-8">
          {/* Brand */}
          <div className="flex-1 flex items-center gap-3.5">
            <Link
              to="/"
              className="flex items-center gap-2.5 text-xl font-black tracking-tight"
            >
              <span className="w-9 h-9 rounded-xl bg-primary text-primary-content flex items-center justify-center font-black shadow-sm">
                <ArrowLeftRight className="w-5 h-5 stroke-[2.5]" />
              </span>
              <span className="text-xl font-extrabold tracking-tight">
                swappy<span className="text-primary font-black">.</span>
              </span>
            </Link>

            <span className="hidden md:inline-flex badge badge-sm badge-neutral font-medium ml-1">
              iPhone Marketplace
            </span>
          </div>

          {/* Quick Nav Links with generous spacing */}
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/explore"
              activeProps={{
                className: "btn-active font-bold text-primary bg-primary/10",
              }}
              className="btn btn-ghost btn-sm h-10 px-4 text-xs sm:text-sm font-semibold rounded-xl inline-flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-primary" />
              <span>Explore</span>
            </Link>
            <Link
              to="/stores"
              activeProps={{
                className: "btn-active font-bold text-accent bg-accent/10",
              }}
              className="btn btn-ghost btn-sm h-10 px-4 text-xs sm:text-sm font-semibold rounded-xl hidden sm:inline-flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-accent" />
              <span>Verified Stores</span>
            </Link>
          </nav>

          {/* Actions with increased breathing room */}
          <div className="flex items-center gap-3 sm:gap-4 pl-1">
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
              className="btn btn-primary btn-sm h-10 px-4 rounded-xl font-bold inline-flex items-center gap-2 shadow-sm text-xs sm:text-sm"
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
                  className="dropdown-content menu menu-sm bg-base-100 rounded-2xl z-50 w-56 p-3 shadow-xl border border-base-300 mt-2 space-y-1.5"
                >
                  <li>
                    <Link
                      to={"/dashboard" as string}
                      className="font-bold py-2.5 inline-flex items-center gap-2.5 rounded-xl"
                    >
                      <LayoutDashboard className="w-4 h-4 text-primary" />
                      <span>Dashboard</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/stores"
                      className="py-2.5 inline-flex items-center gap-2.5 rounded-xl"
                    >
                      <ShieldCheck className="w-4 h-4 text-accent" />
                      <span>Verified Stores</span>
                    </Link>
                  </li>
                  <div className="divider my-1.5" />
                  <li>
                    <button
                      onClick={handleSignOut}
                      className="text-error font-semibold py-2.5 inline-flex items-center gap-2.5 rounded-xl"
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
                className="btn btn-ghost btn-sm h-10 px-4 text-xs sm:text-sm font-semibold rounded-xl"
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
