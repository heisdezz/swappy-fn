import { Footer } from "#/components/layout/Footer.tsx";
import { PublicNavbar } from "#/components/layout/PublicNavbar.tsx";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/app/auth")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <PublicNavbar />
      <Outlet />
      <Footer />
    </>
  );
}
