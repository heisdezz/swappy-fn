import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ExternalLink,
  MapPin,
  MessageCircle,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  Store,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { pb } from "../../client/pb";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import SimpleInput from "../../components/inputs/SimpleInput";
import SimpleTextArea from "../../components/inputs/SimpleTextArea";
import { PaymentModal } from "../../components/payments/PaymentModal";
import PageLoader from "../../components/wrappers/PageLoader";
import { extract_message } from "../../helpers/api";

export const Route = createFileRoute("/dashboard/stores")({
  ssr: false,
  component: DashboardStoresPage,
});

interface StoreFormValues {
  name: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  whatsapp: string;
  description: string;
}

function DashboardStoresPage() {
  const userId = pb.authStore.record?.id;

  const storeQuery = useQuery({
    queryKey: ["my-store", userId],
    queryFn: async () => {
      if (!userId) return null;
      const res = await pb.collection("store").getList(1, 1, {
        filter: `owner = "${userId}"`,
        requestKey: null,
      });
      return res.items.length > 0 ? res.items[0] : null;
    },
  });

  return (
    <DashboardLayout activeTab="store">
      <PageLoader query={storeQuery}>
        {(store) =>
          store ? (
            <StoreManagementView store={store} />
          ) : (
            <CreateStoreOnboardingView />
          )
        }
      </PageLoader>
    </DashboardLayout>
  );
}

function StoreManagementView({ store }: { store: Record<string, any> }) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const methods = useForm<StoreFormValues>({
    defaultValues: {
      name: store.name || "",
      slug: store.slug || "",
      address: store.address || "",
      city: store.city || "",
      state: store.state || "",
      phone: store.phone || "",
      whatsapp: store.whatsapp || "",
      description: store.description || "",
    },
  });

  const { register, handleSubmit } = methods;

  const currentLogoUrl = logoFile
    ? URL.createObjectURL(logoFile)
    : store.logo
      ? pb.files.getURL(store, store.logo)
      : null;

  const currentBannerUrl = bannerFile
    ? URL.createObjectURL(bannerFile)
    : store.banner
      ? pb.files.getURL(store, store.banner)
      : null;

  const onSubmit = async (data: StoreFormValues) => {
    setIsSubmitting(true);
    setSaveSuccess(false);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("slug", data.slug);
      formData.append("address", data.address);
      formData.append("city", data.city);
      formData.append("state", data.state);
      formData.append("phone", data.phone);
      formData.append("whatsapp", data.whatsapp);
      formData.append("description", data.description);

      if (logoFile) {
        formData.append("logo", logoFile);
      }
      if (bannerFile) {
        formData.append("banner", bannerFile);
      }

      await pb.collection("store").update(store.id, formData);
      setSaveSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["my-store"] });
      queryClient.invalidateQueries({ queryKey: ["stores-nav"] });
    } catch (err) {
      console.error("Error updating store:", err);
      setErrorMessage(extract_message(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 w-full">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-base-content tracking-tight">
              {store.name || "Store Hub"}
            </h1>
            {store.is_verified ? (
              <span className="badge badge-success badge-sm font-bold text-success-content inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified Dealer</span>
              </span>
            ) : (
              <span className="badge badge-warning badge-sm font-bold inline-flex items-center gap-1">
                <span>Verification In Progress</span>
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-base-content/70 mt-1">
            Manage your physical shop profile, location credentials, and public
            storefront.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {store.slug && (
            <Link
              to={"/store/$slug" as string}
              params={{ slug: store.slug }}
              target="_blank"
              className="btn btn-outline btn-sm rounded-xl font-bold text-xs inline-flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Storefront</span>
            </Link>
          )}

          <button
            type="submit"
            form="store-profile-form"
            disabled={isSubmitting}
            className="btn btn-primary btn-sm rounded-xl font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
          >
            {isSubmitting ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>Save Store</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="alert alert-success rounded-2xl text-xs font-bold text-success-content flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Store details saved successfully.</span>
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-error rounded-2xl text-xs font-bold text-error-content flex items-center gap-2 shadow-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Store Banner & Brand Identity Preview */}
      <div className="bg-base-100 rounded-3xl border border-base-300 overflow-hidden shadow-xs w-full">
        {/* Banner Area */}
        <div className="h-44 sm:h-52 bg-base-200 relative overflow-hidden flex items-center justify-center">
          {currentBannerUrl ? (
            <img
              src={currentBannerUrl}
              alt="Store Banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-base-content/40 space-y-1">
              <Building2 className="w-10 h-10 stroke-[1.5] border-0" />
              <span className="text-xs font-bold">No custom banner set</span>
            </div>
          )}

          {/* Banner Upload Button */}
          <label className="absolute right-4 bottom-4 btn btn-neutral btn-xs rounded-xl font-bold cursor-pointer opacity-90 hover:opacity-100 shadow-sm inline-flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" />
            <span>Change Banner</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) setBannerFile(e.target.files[0]);
              }}
            />
          </label>
        </div>

        {/* Logo and Quick Info Strip */}
        <div className="p-6 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10">
          <div className="flex items-end gap-4">
            <div className="relative group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-base-100 p-1.5 border-2 border-base-300 shadow-md shrink-0">
                {currentLogoUrl ? (
                  <img
                    src={currentLogoUrl}
                    alt={store.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-2xl">
                    {store.name ? store.name.charAt(0).toUpperCase() : "S"}
                  </div>
                )}
              </div>
              <label className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-white text-[10px] font-bold">
                <Upload className="w-4 h-4 mr-1" />
                Change
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) setLogoFile(e.target.files[0]);
                  }}
                />
              </label>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-base-content leading-tight">
                {store.name}
              </h2>
              <div className="flex items-center gap-3 text-xs text-base-content/60 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span>
                    {store.city || "Ikeja"}, {store.state || "Lagos"}
                  </span>
                </span>
                {store.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{store.phone}</span>
                  </span>
                )}
                {store.whatsapp && (
                  <span className="flex items-center gap-1 text-success font-semibold">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{store.whatsapp}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/dashboard/phones"
              className="btn btn-ghost btn-sm rounded-xl font-bold text-xs"
            >
              Manage Store Inventory
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Settings & Trust Verification */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Left Column: Form Details (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-base-100 rounded-3xl border border-base-300 p-6 space-y-5 shadow-xs w-full">
            <div className="border-b border-base-200 pb-3">
              <h3 className="font-extrabold text-base text-base-content">
                Storefront Information
              </h3>
              <p className="text-xs text-base-content/60 mt-0.5">
                Buyer-facing identity shown on listing cards and store pages
              </p>
            </div>

            <FormProvider {...methods}>
              <form
                id="store-profile-form"
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SimpleInput
                    label="Store Name"
                    placeholder="e.g. Swappy Prime Gadgets"
                    {...register("name", {
                      required: "Store name is required",
                    })}
                  />

                  <SimpleInput
                    label="Storefront URL Slug"
                    placeholder="e.g. swappy-prime"
                    {...register("slug", {
                      required: "Store slug is required",
                    })}
                  />
                </div>

                <SimpleInput
                  label="Physical Shop Address"
                  placeholder="e.g. Shop 12, Digital Square, Pepple Street, Computer Village"
                  {...register("address", {
                    required: "Physical address is required",
                  })}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SimpleInput
                    label="City / Market Area"
                    placeholder="e.g. Ikeja"
                    {...register("city", { required: "City is required" })}
                  />

                  <SimpleInput
                    label="State"
                    placeholder="e.g. Lagos"
                    {...register("state", { required: "State is required" })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SimpleInput
                    label="Contact Phone"
                    placeholder="e.g. +234 802 123 4567"
                    {...register("phone")}
                  />

                  <SimpleInput
                    label="WhatsApp Business Number"
                    placeholder="e.g. 2348021234567"
                    {...register("whatsapp")}
                  />
                </div>

                <SimpleTextArea
                  label="Store Description & Trade Policy"
                  rows={4}
                  placeholder="Tell buyers about your shop, available stock, physical testing policy, and warranties..."
                  {...register("description")}
                />
              </form>
            </FormProvider>
          </div>
        </div>

        {/* Right Column: Verification & Trust Status */}
        <div className="space-y-6">
          {/* Verification Status Card */}
          <div className="bg-base-100 rounded-3xl border border-base-300 p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <h3 className="font-extrabold text-base text-base-content">
                Dealer Verification
              </h3>
            </div>

            <p className="text-xs text-base-content/70 leading-relaxed">
              Verified merchants enjoy higher placement in search results, a
              verified dealer badge, and customer trust.
            </p>

            <div className="p-3.5 rounded-2xl bg-base-200/60 border border-base-300/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-base-content/70">
                  Shop Address
                </span>
                <span className="badge badge-success badge-xs font-bold">
                  Verified
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-base-content/70">
                  Contact Number
                </span>
                <span className="badge badge-success badge-xs font-bold">
                  Verified
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-base-content/70">
                  Government ID
                </span>
                <span className="badge badge-neutral badge-xs font-bold">
                  Submitted
                </span>
              </div>
            </div>

            <div className="text-[11px] text-base-content/50 leading-relaxed">
              Need assistance updating business credentials? Contact Swappy
              merchant support.
            </div>
          </div>

          {/* Storefront Promotion Card */}
          <div className="bg-linear-to-br from-primary/10 via-base-100 to-secondary/10 rounded-3xl border border-primary/20 p-6 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-primary font-black text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Boost Store Visibility</span>
            </div>
            <p className="text-xs text-base-content/70 leading-relaxed">
              Feature your store prominently on the homepage and at the top of
              category searches to drive 5x more buyer leads.
            </p>
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(true)}
              className="btn btn-outline btn-primary btn-sm rounded-xl w-full text-xs font-bold cursor-pointer"
            >
              Explore Store Promotions
            </button>
          </div>
        </div>
      </div>

      {/* Paystack Subscription Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        type="subscription"
      />
    </div>
  );
}

function CreateStoreOnboardingView() {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const methods = useForm<StoreFormValues>({
    defaultValues: {
      name: "",
      slug: "",
      address: "",
      city: "",
      state: "",
      phone: "",
      whatsapp: "",
      description: "",
    },
  });

  const { register, handleSubmit, setValue, watch } = methods;
  const storeName = watch("name");

  // Auto-generate slug from name if not manually modified
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nameVal = e.target.value;
    setValue("name", nameVal);
    const generatedSlug = nameVal
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setValue("slug", generatedSlug);
  };

  const onSubmit = async (data: StoreFormValues) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const userId = pb.authStore.record?.id;
      if (!userId) {
        throw new Error("You must be logged in to create a store.");
      }

      await pb.collection("store").create({
        owner: userId,
        name: data.name,
        slug: data.slug,
        address: data.address,
        city: data.city,
        state: data.state,
        phone: data.phone,
        whatsapp: data.whatsapp,
        description: data.description,
        is_verified: false,
      });

      queryClient.invalidateQueries({ queryKey: ["my-store"] });
      queryClient.invalidateQueries({ queryKey: ["stores-nav"] });
    } catch (err) {
      console.error("Error creating store:", err);
      setErrorMessage(extract_message(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Onboarding Welcome Banner */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-3xl bg-primary/20 text-primary flex items-center justify-center mx-auto shadow-sm">
          <Store className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-base-content tracking-tight">
          Create Your Verified Storefront
        </h1>
        <p className="text-xs sm:text-sm text-base-content/70">
          Establish your physical phone dealership on Swappy. Receive verified
          dealer status, direct WhatsApp buyer connections, and physical
          trade-in protection.
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-base-100 border border-base-300 text-center space-y-1.5 shadow-xs">
          <ShieldCheck className="w-6 h-6 text-primary mx-auto" />
          <div className="font-extrabold text-xs text-base-content">
            Verified Merchant Badge
          </div>
          <p className="text-[11px] text-base-content/60">
            Build instant buyer confidence across Nigeria.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-base-100 border border-base-300 text-center space-y-1.5 shadow-xs">
          <MapPin className="w-6 h-6 text-secondary mx-auto" />
          <div className="font-extrabold text-xs text-base-content">
            Physical Hub Presence
          </div>
          <p className="text-[11px] text-base-content/60">
            Pinpoint your shop in Computer Village or Banex.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-base-100 border border-base-300 text-center space-y-1.5 shadow-xs">
          <MessageCircle className="w-6 h-6 text-accent mx-auto" />
          <div className="font-extrabold text-xs text-base-content">
            Direct WhatsApp Leads
          </div>
          <p className="text-[11px] text-base-content/60">
            Buyers contact your sales desk with a single click.
          </p>
        </div>
      </div>

      {/* Registration Form Card */}
      <div className="bg-base-100 rounded-3xl border border-base-300 p-6 sm:p-8 space-y-6 shadow-xs w-full">
        <div className="border-b border-base-200 pb-3">
          <h2 className="font-extrabold text-base text-base-content">
            Store Registration Form
          </h2>
          <p className="text-xs text-base-content/60">
            Fill in your shop details to create your merchant profile
          </p>
        </div>

        {errorMessage && (
          <div className="alert alert-error rounded-2xl text-xs font-bold text-error-content flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SimpleInput
                label="Store Name"
                placeholder="e.g. Swappy Prime Gadgets"
                value={storeName}
                onChange={handleNameChange}
                required
              />

              <SimpleInput
                label="Storefront URL Slug"
                placeholder="e.g. swappy-prime"
                {...register("slug", { required: "Slug is required" })}
              />
            </div>

            <SimpleInput
              label="Physical Shop Address"
              placeholder="e.g. Shop 12, Digital Square, Pepple Street, Computer Village"
              {...register("address", { required: "Address is required" })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SimpleInput
                label="City / Market Area"
                placeholder="e.g. Ikeja"
                {...register("city", { required: "City is required" })}
              />

              <SimpleInput
                label="State"
                placeholder="e.g. Lagos"
                {...register("state", { required: "State is required" })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SimpleInput
                label="Contact Phone"
                placeholder="e.g. +234 802 123 4567"
                {...register("phone")}
              />

              <SimpleInput
                label="WhatsApp Number (with country code)"
                placeholder="e.g. 2348021234567"
                {...register("whatsapp")}
              />
            </div>

            <SimpleTextArea
              label="Store Description & Trade Policy"
              rows={3}
              placeholder="Brief description of devices you stock, warranty terms, and store opening times..."
              {...register("description")}
            />

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary rounded-xl font-bold w-full shadow-sm text-sm"
              >
                {isSubmitting ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <Store className="w-4 h-4 mr-1.5" />
                )}
                <span>Create Storefront</span>
              </button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
