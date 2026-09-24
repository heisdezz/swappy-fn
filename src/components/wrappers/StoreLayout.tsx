import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";
import { Outlet } from "@tanstack/react-router";

export default function StoreLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-base-100 flex flex-col antialiased">
      <PublicNavbar />
      <main className="flex-1">{children || <Outlet />}</main>
      <Footer />
    </div>
  );
}
