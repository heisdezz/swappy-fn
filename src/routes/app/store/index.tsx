import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/store/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/app/store/"!</div>;
}
