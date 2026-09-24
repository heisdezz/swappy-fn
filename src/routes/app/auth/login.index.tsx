import { createFileRoute } from "@tanstack/react-router";
import { AuthCard } from "../../../components/auth/AuthCard";
import { LoginForm } from "../../../components/auth/LoginForm";

interface LoginSearch {
  redirect?: string;
}

export const Route = createFileRoute("/app/auth/login/")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => {
    return {
      redirect:
        typeof search.redirect === "string" ? search.redirect : undefined,
    };
  },
  component: LoginPage,
});

function LoginPage() {
  const { redirect } = Route.useSearch();

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your Swappy account to manage swap offers and verified listings."
    >
      <LoginForm redirectUrl={redirect || "/dashboard"} />
    </AuthCard>
  );
}
