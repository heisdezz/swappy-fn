import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  Save,
  ShieldCheck,
  Upload,
  User,
} from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { pb } from "../../client/pb";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import SimpleInput from "../../components/inputs/SimpleInput";
import SimpleTextArea from "../../components/inputs/SimpleTextArea";
import PageLoader from "../../components/wrappers/PageLoader";
import { extract_message } from "../../helpers/api";

export const Route = createFileRoute("/dashboard/settings")({
  ssr: false,
  component: DashboardSettingsPage,
});

interface ProfileFormValues {
  name: string;
  phone: string;
  location_city: string;
  location_state: string;
  bio: string;
}

interface PasswordFormValues {
  oldPassword: string;
  password: string;
  passwordConfirm: string;
}

function DashboardSettingsPage() {
  const userId = pb.authStore.record?.id;

  const accountQuery = useQuery({
    queryKey: ["account-settings", userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return null;
      const user = await pb.collection("users").getOne(userId, {
        requestKey: null,
      });

      let profile = null;
      try {
        const profileList = await pb.collection("profile").getList(1, 1, {
          filter: `user = "${userId}"`,
          requestKey: null,
        });
        if (profileList.items.length > 0) {
          profile = profileList.items[0];
        }
      } catch {
        // Fallback if profile record doesn't exist
      }

      return { user, profile };
    },
  });

  return (
    <DashboardLayout activeTab="settings">
      <PageLoader query={accountQuery}>
        {(data) => {
          if (!data || !data.user) {
            return (
              <div className="text-center py-16 bg-base-100 rounded-3xl border border-base-300">
                <p className="text-sm font-bold text-base-content/70">
                  Please log in to manage your account settings.
                </p>
              </div>
            );
          }
          return <SettingsContent user={data.user} profile={data.profile} />;
        }}
      </PageLoader>
    </DashboardLayout>
  );
}

function SettingsContent({ user, profile }: { user: any; profile: any }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Profile Form State
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Password Form State
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const profileMethods = useForm<ProfileFormValues>({
    defaultValues: {
      name: user.name || "",
      phone: user.phone || "",
      location_city: profile?.location_city || "Ikeja",
      location_state: profile?.location_state || "Lagos",
      bio: profile?.bio || "",
    },
  });

  const passwordMethods = useForm<PasswordFormValues>({
    defaultValues: {
      oldPassword: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const avatarUrl = avatarFile
    ? URL.createObjectURL(avatarFile)
    : user.avatar
      ? pb.files.getURL(user, user.avatar)
      : null;

  const handleProfileSubmit = async (data: ProfileFormValues) => {
    setIsUpdatingProfile(true);
    setProfileError("");
    setProfileSuccess(false);

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("phone", data.phone);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const updatedUser = await pb
        .collection("users")
        .update(user.id, formData);

      // Also update or create profile record if present
      if (profile?.id) {
        await pb.collection("profile").update(profile.id, {
          location_city: data.location_city,
          location_state: data.location_state,
          bio: data.bio,
        });
      } else {
        try {
          await pb.collection("profile").create({
            user: user.id,
            location_city: data.location_city,
            location_state: data.location_state,
            bio: data.bio,
            email: user.email,
          });
        } catch {
          // Non-critical profile creation failure
        }
      }

      // Sync local authStore record
      pb.authStore.save(pb.authStore.token, updatedUser as any);

      queryClient.invalidateQueries({
        queryKey: ["account-settings", user.id],
      });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 4000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setProfileError(extract_message(err));
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (data: PasswordFormValues) => {
    if (data.password !== data.passwordConfirm) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (data.password.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordError("");
    setPasswordSuccess(false);

    try {
      await pb.collection("users").update(user.id, {
        oldPassword: data.oldPassword,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
      });

      passwordMethods.reset();
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch (err) {
      console.error("Error updating password:", err);
      setPasswordError(extract_message(err));
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSignOut = () => {
    pb.authStore.clear();
    navigate({ to: "/" });
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-base-content tracking-tight">
          Account Settings
        </h1>
        <p className="text-xs sm:text-sm text-base-content/70 mt-1">
          Manage your personal identity, contact details, security credentials,
          and trader trust level.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile & Security (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Form Card */}
          <div className="bg-base-100 rounded-3xl border border-base-300 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="border-b border-base-200 pb-4">
              <h2 className="text-base font-extrabold text-base-content">
                Personal & Contact Information
              </h2>
              <p className="text-xs text-base-content/60">
                Visible to verified buyers and trade partners during
                negotiations
              </p>
            </div>

            {profileSuccess && (
              <div className="alert alert-success rounded-2xl text-xs font-bold text-success-content flex items-center gap-2 shadow-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Profile details updated successfully.</span>
              </div>
            )}

            {profileError && (
              <div className="alert alert-error rounded-2xl text-xs font-bold text-error-content flex items-center gap-2 shadow-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <FormProvider {...profileMethods}>
              <form
                onSubmit={profileMethods.handleSubmit(handleProfileSubmit)}
                className="space-y-5"
              >
                {/* Avatar Uploader */}
                <div className="flex items-center gap-5">
                  <div className="relative group">
                    <div className="w-20 h-20 rounded-2xl bg-base-200 border-2 border-base-300 overflow-hidden flex items-center justify-center shadow-sm">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={user.name || "User"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-base-content/40" />
                      )}
                    </div>
                    <label className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-white text-[10px] font-bold">
                      <Upload className="w-3.5 h-3.5 mr-1" />
                      <span>Change</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0])
                            setAvatarFile(e.target.files[0]);
                        }}
                      />
                    </label>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-base-content">
                      Profile Photo
                    </div>
                    <p className="text-[11px] text-base-content/60 mt-0.5">
                      Square JPG or PNG, max 5MB. Clear face photo builds trust
                      for in-person trades.
                    </p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SimpleInput
                    label="Full Name / Trader Alias"
                    placeholder="e.g. Samuel Adekunle"
                    {...profileMethods.register("name", {
                      required: "Name is required",
                    })}
                  />

                  <SimpleInput
                    label="Phone Number"
                    placeholder="e.g. +234 803 123 4567"
                    {...profileMethods.register("phone")}
                  />
                </div>

                {/* Email (Read-only System Field) */}
                <div>
                  <label className="text-xs font-extrabold text-base-content block mb-1">
                    Registered Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-base-content/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="input input-bordered w-full pl-10 rounded-2xl bg-base-200/50 text-xs font-semibold text-base-content/70 cursor-not-allowed"
                    />
                  </div>
                  <span className="text-[10px] text-base-content/50 mt-1 block">
                    Account email cannot be modified directly for security
                    reasons.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SimpleInput
                    label="Primary City"
                    placeholder="e.g. Ikeja"
                    {...profileMethods.register("location_city")}
                  />

                  <SimpleInput
                    label="State"
                    placeholder="e.g. Lagos"
                    {...profileMethods.register("location_state")}
                  />
                </div>

                <SimpleTextArea
                  label="Seller Introduction / Bio"
                  rows={3}
                  placeholder="Tell buyers about your trading specialty, inspection guarantees, and availability..."
                  {...profileMethods.register("bio")}
                />

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="btn btn-primary btn-sm rounded-xl font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
                  >
                    {isUpdatingProfile ? (
                      <span className="loading loading-spinner loading-xs" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>Save Profile</span>
                  </button>
                </div>
              </form>
            </FormProvider>
          </div>

          {/* Password & Security Card */}
          <div className="bg-base-100 rounded-3xl border border-base-300 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="border-b border-base-200 pb-4">
              <h2 className="text-base font-extrabold text-base-content flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-primary" />
                <span>Security & Password</span>
              </h2>
              <p className="text-xs text-base-content/60">
                Update your account password to protect your listing data and
                payout records
              </p>
            </div>

            {passwordSuccess && (
              <div className="alert alert-success rounded-2xl text-xs font-bold text-success-content flex items-center gap-2 shadow-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Password changed successfully.</span>
              </div>
            )}

            {passwordError && (
              <div className="alert alert-error rounded-2xl text-xs font-bold text-error-content flex items-center gap-2 shadow-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <FormProvider {...passwordMethods}>
              <form
                onSubmit={passwordMethods.handleSubmit(handlePasswordSubmit)}
                className="space-y-4"
              >
                <SimpleInput
                  label="Current Password"
                  type="password"
                  placeholder="Enter current account password"
                  {...passwordMethods.register("oldPassword", {
                    required: "Current password is required",
                  })}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SimpleInput
                    label="New Password"
                    type="password"
                    placeholder="Minimum 8 characters"
                    {...passwordMethods.register("password", {
                      required: "New password is required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters",
                      },
                    })}
                  />

                  <SimpleInput
                    label="Confirm New Password"
                    type="password"
                    placeholder="Repeat new password"
                    {...passwordMethods.register("passwordConfirm", {
                      required: "Password confirmation is required",
                    })}
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="btn btn-outline btn-primary btn-sm rounded-xl font-bold text-xs inline-flex items-center gap-1.5"
                  >
                    {isUpdatingPassword ? (
                      <span className="loading loading-spinner loading-xs" />
                    ) : (
                      <Lock className="w-3.5 h-3.5" />
                    )}
                    <span>Update Password</span>
                  </button>
                </div>
              </form>
            </FormProvider>
          </div>
        </div>

        {/* Right Column: Account Badge & Status (1 col) */}
        <div className="space-y-6">
          {/* Trust Status Card */}
          <div className="bg-base-100 rounded-3xl border border-base-300 p-6 space-y-4 shadow-xs">
            <h3 className="font-extrabold text-sm text-base-content border-b border-base-200 pb-3">
              Account Verification Status
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-base-content/70">
                  Seller Role
                </span>
                <span className="badge badge-primary badge-xs font-bold capitalize">
                  {user.role || "User"}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-base-content/70">
                  Email Status
                </span>
                {user.verified ? (
                  <span className="text-success font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </span>
                ) : (
                  <span className="text-warning font-bold">Unverified</span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-base-content/70">
                  Phone Check
                </span>
                {user.phone ? (
                  <span className="text-success font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active</span>
                  </span>
                ) : (
                  <span className="text-base-content/40 font-bold">
                    Not Provided
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-base-content/70">
                  User ID
                </span>
                <span className="font-mono text-[10px] text-base-content/50">
                  {user.id}
                </span>
              </div>
            </div>
          </div>

          {/* Physical Verification Advisory */}
          <div className="bg-primary/10 rounded-3xl border border-primary/20 p-5 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-base-content">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Trader Protection Protocol</span>
            </div>
            <p className="text-[11px] text-base-content/75 leading-relaxed">
              For security, phone trade negotiations must always conclude with
              in-person hardware verification in designated public spots
              (Computer Village Ikeja, Banex Plaza Abuja).
            </p>
          </div>

          {/* Sign Out Card */}
          <div className="bg-base-100 rounded-3xl border border-base-300 p-6 space-y-3 shadow-xs">
            <h3 className="font-extrabold text-sm text-base-content">
              Session Management
            </h3>
            <p className="text-xs text-base-content/60">
              End your active session across this browser.
            </p>
            <button
              onClick={handleSignOut}
              className="btn btn-outline btn-error btn-sm w-full rounded-xl font-bold inline-flex items-center justify-center gap-2 text-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out of Swappy</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
