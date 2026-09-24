import { Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, Lock, LogIn, Mail } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { pb } from "../../client/pb";
import SimpleInput from "../inputs/SimpleInput";

interface LoginFormProps {
  onSuccess?: () => void;
  redirectUrl?: string;
}

interface LoginFormValues {
  identity: string;
  password: string;
  rememberMe: boolean;
}

export function LoginForm({
  onSuccess,
  redirectUrl = "/dashboard",
}: LoginFormProps) {
  const [authError, setAuthError] = useState("");
  const navigate = useNavigate();

  const methods = useForm<LoginFormValues>({
    defaultValues: {
      identity: "",
      password: "",
      rememberMe: true,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (values: LoginFormValues) => {
    setAuthError("");
    try {
      await pb
        .collection("users")
        .authWithPassword(values.identity.trim(), values.password);

      if (onSuccess) {
        onSuccess();
      } else {
        navigate({ to: redirectUrl as string });
      }
    } catch (err: unknown) {
      const error = err as { message?: string; status?: number };
      if (error.status === 400) {
        setAuthError(
          "Invalid email, phone number, or password. Please try again.",
        );
      } else {
        setAuthError(
          error.message ||
            "Failed to authenticate. Please check your connection and try again.",
        );
      }
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {authError && (
          <div className="p-3.5 rounded-2xl bg-error/15 border border-error/30 text-error flex items-start gap-2.5 text-xs animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="leading-snug">{authError}</span>
          </div>
        )}

        {/* Identity Input */}
        <SimpleInput
          label="Email or Phone Number"
          icon={<Mail className="w-4 h-4" />}
          placeholder="e.g. buyer@example.com or +234..."
          autoComplete="username"
          disabled={isSubmitting}
          {...register("identity", {
            required: "Email or phone number is required.",
          })}
        />

        {/* Password Input */}
        <SimpleInput
          label={
            <div className="flex items-center justify-between w-full">
              <span>Password</span>
              <button
                type="button"
                onClick={() =>
                  alert(
                    "Password reset instructions will be sent to your registered email.",
                  )
                }
                className="text-[11px] font-bold text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>
          }
          type="password"
          icon={<Lock className="w-4 h-4" />}
          placeholder="Enter your account password"
          autoComplete="current-password"
          disabled={isSubmitting}
          {...register("password", {
            required: "Password is required.",
          })}
        />

        {/* Remember Me Checkbox */}
        <div className="flex items-center justify-between pt-1">
          <label className="label cursor-pointer p-0 gap-2">
            <input
              type="checkbox"
              {...register("rememberMe")}
              className="checkbox checkbox-primary checkbox-xs rounded-md"
            />
            <span className="text-xs text-base-content/70 select-none">
              Keep me signed in
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary btn-block rounded-xl font-bold text-sm shadow-sm inline-flex items-center justify-center gap-2 mt-2 h-12"
        >
          {isSubmitting ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Sign In to Swappy</span>
            </>
          )}
        </button>

        {/* Register Link */}
        <div className="text-center pt-2 text-xs text-base-content/70">
          <span>Do not have an account? </span>
          <Link
            to={"/app/auth/signup" as string}
            className="font-bold text-primary hover:underline"
          >
            Create an account
          </Link>
        </div>
      </form>
    </FormProvider>
  );
}
