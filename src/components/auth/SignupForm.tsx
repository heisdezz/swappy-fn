import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Lock,
  Mail,
  Phone,
  Store,
  User,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { pb } from "../../client/pb";
import SimpleInput from "../inputs/SimpleInput";

interface SignupFormProps {
  onSuccess?: () => void;
  redirectUrl?: string;
}

interface SignupFormValues {
  role: "user" | "verified_seller";
  email: string;
  phone: string;
  password: string;
  passwordConfirm: string;
  agreeTerms: boolean;
}

export function SignupForm({
  onSuccess,
  redirectUrl = "/dashboard",
}: SignupFormProps) {
  const [signupError, setSignupError] = useState("");
  const navigate = useNavigate();

  const methods = useForm<SignupFormValues>({
    defaultValues: {
      role: "user",
      email: "",
      phone: "",
      password: "",
      passwordConfirm: "",
      agreeTerms: true,
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = methods;

  const selectedRole = watch("role");
  const currentPassword = watch("password");

  const onSubmit = async (values: SignupFormValues) => {
    setSignupError("");

    try {
      // 1. Create user in PocketBase
      await pb.collection("users").create({
        email: values.email.trim().toLowerCase(),
        password: values.password,
        passwordConfirm: values.passwordConfirm,
        phone: values.phone.trim(),
        role: values.role,
        emailVisibility: false,
      });

      // 2. Automatically log in after registration
      await pb
        .collection("users")
        .authWithPassword(values.email.trim(), values.password);

      if (onSuccess) {
        onSuccess();
      } else {
        const dest =
          values.role === "verified_seller" ? "/dashboard" : redirectUrl;
        navigate({ to: dest as string });
      }
    } catch (err: unknown) {
      const error = err as {
        message?: string;
        data?: { data?: Record<string, { message: string }> };
      };

      if (error.data?.data) {
        const firstField = Object.keys(error.data.data)[0];
        const fieldMsg = error.data.data[firstField]?.message;
        setSignupError(`${firstField}: ${fieldMsg || "Invalid value"}`);
      } else {
        setSignupError(
          error.message ||
            "Failed to create account. Email may already be in use.",
        );
      }
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {signupError && (
          <div className="p-3.5 rounded-2xl bg-error/15 border border-error/30 text-error flex items-start gap-2.5 text-xs animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="leading-snug">{signupError}</span>
          </div>
        )}

        {/* Role Selector: Individual Trader vs Merchant Store */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-base-content block">
            Select Account Intent
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setValue("role", "user")}
              className={`p-3.5 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                selectedRole === "user"
                  ? "border-primary bg-primary/10 text-base-content font-bold shadow-sm ring-1 ring-primary/40"
                  : "border-base-300 bg-base-200/50 text-base-content/70 hover:border-base-content/20"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-primary" />
                <span className="text-xs font-extrabold">
                  Individual Trader
                </span>
              </div>
              <span className="text-[10px] text-base-content/60 leading-tight">
                Swap, buy, and sell personal iPhones
              </span>
            </button>

            <button
              type="button"
              onClick={() => setValue("role", "verified_seller")}
              className={`p-3.5 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                selectedRole === "verified_seller"
                  ? "border-primary bg-primary/10 text-base-content font-bold shadow-sm ring-1 ring-primary/40"
                  : "border-base-300 bg-base-200/50 text-base-content/70 hover:border-base-content/20"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Store className="w-4 h-4 text-secondary" />
                <span className="text-xs font-extrabold">Merchant Hub</span>
              </div>
              <span className="text-[10px] text-base-content/60 leading-tight">
                Dealer storefront with inventory tools
              </span>
            </button>
          </div>
        </div>

        {/* Email Input */}
        <SimpleInput
          label="Email Address"
          type="email"
          autoComplete="email"
          placeholder="e.g. destiny@example.com"
          disabled={isSubmitting}
          icon={<Mail className="w-4 h-4" />}
          {...register("email", {
            required: "Email address is required.",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Please enter a valid email address.",
            },
          })}
        />

        {/* Phone Number */}
        <SimpleInput
          label="WhatsApp / Phone Contact"
          type="tel"
          autoComplete="tel"
          placeholder="+234 803 123 4567"
          disabled={isSubmitting}
          icon={<Phone className="w-4 h-4" />}
          {...register("phone", {
            required: "Phone number is required for buyer inquiries and swaps.",
            minLength: {
              value: 8,
              message: "Please enter a valid phone number.",
            },
          })}
        />

        {/* Password & Confirm Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SimpleInput
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="Min 8 characters"
            disabled={isSubmitting}
            icon={<Lock className="w-4 h-4" />}
            {...register("password", {
              required: "Password is required.",
              minLength: {
                value: 8,
                message: "Must be at least 8 characters.",
              },
            })}
          />

          <SimpleInput
            label="Confirm Password"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter password"
            disabled={isSubmitting}
            icon={<Lock className="w-4 h-4" />}
            {...register("passwordConfirm", {
              required: "Please confirm your password.",
              validate: (value) =>
                value === currentPassword || "Passwords do not match.",
            })}
          />
        </div>

        {/* Agree to Terms */}
        <div className="pt-1">
          <label className="label cursor-pointer p-0 gap-2 items-start">
            <input
              type="checkbox"
              disabled={isSubmitting}
              {...register("agreeTerms", {
                validate: (val) =>
                  val === true ||
                  "You must accept the safety guidelines to proceed.",
              })}
              className="checkbox checkbox-primary checkbox-xs rounded-md mt-0.5"
            />
            <span className="text-[11px] text-base-content/75 select-none leading-tight">
              I agree to the Swappy marketplace safety protocol and verified
              physical inspection rules.
            </span>
          </label>
          {errors.agreeTerms && (
            <p className="text-[11px] font-semibold text-error pl-1 block mt-1">
              {errors.agreeTerms.message}
            </p>
          )}
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
              <UserPlus className="w-4 h-4" />
              <span>Create Swappy Account</span>
            </>
          )}
        </button>

        {/* Login Link */}
        <div className="text-center pt-2 text-xs text-base-content/70">
          <span>Already have an account? </span>
          <Link
            to={"/app/auth/login" as string}
            className="font-bold text-primary hover:underline"
          >
            Sign in
          </Link>
        </div>
      </form>
    </FormProvider>
  );
}
