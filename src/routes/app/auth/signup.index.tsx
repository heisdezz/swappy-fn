import { createFileRoute } from "@tanstack/react-router";
import { AuthCard } from "../../../components/auth/AuthCard";
import { SignupForm } from "../../../components/auth/SignupForm";

interface SignupSearch {
  redirect?: string;
}

export const Route = createFileRoute("/app/auth/signup/")({
  validateSearch: (search: Record<string, unknown>): SignupSearch => {
    return {
      redirect:
        typeof search.redirect === "string" ? search.redirect : undefined,
    };
  },
  component: SignupPage,
});

function SignupPage() {
  const { redirect } = Route.useSearch();

  return (
    <AuthCard
      title="Create your account"
      subtitle="Join verified buyers and iPhone dealers across Nigeria on Swappy."
    >
      <SignupForm redirectUrl={redirect || "/dashboard"} />
    </AuthCard>
  );
}
