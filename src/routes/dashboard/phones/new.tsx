import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  ArrowLeftRight,
  BatteryCharging,
  CheckCircle2,
  Cpu,
  Eye,
  Lock,
  MapPin,
  Plus,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Store,
  Wrench,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { pb } from "../../../client/pb";
import { DashboardLayout } from "../../../components/dashboard/DashboardLayout";
import LocalSelect from "../../../components/inputs/LocalSelect";
import SimpleInput from "../../../components/inputs/SimpleInput";
import SimpleTextArea from "../../../components/inputs/SimpleTextArea";
import UpdateImages from "../../../components/inputs/UpdateImages";
import { extract_message } from "../../../helpers/api";

export const Route = createFileRoute("/dashboard/phones/new")({
  ssr: false,
  component: PostNewPhonePage,
});

interface CreatePhoneFormValues {
  title: string;
  model: string;
  category?: string;
  price: number;
  storage: string;
  color: string;
  battery_health: number;
  condition: string;
  carrier_status: string;
  sim_type: string;
  has_face_id: boolean;
  has_truetone: boolean;
  accepts_swap: boolean;
  swap_preferences: string;
  issues: string;
  location_city: string;
  location_state: string;
  status: "active" | "paused";
  description: string;
}

const FALLBACK_IPHONE_MODELS = [
  "iPhone 16 Pro Max",
  "iPhone 16 Pro",
  "iPhone 16 Plus",
  "iPhone 16",
  "iPhone 15 Pro Max",
  "iPhone 15 Pro",
  "iPhone 15 Plus",
  "iPhone 15",
  "iPhone 14 Pro Max",
  "iPhone 14 Pro",
  "iPhone 14 Plus",
  "iPhone 14",
  "iPhone 13 Pro Max",
  "iPhone 13 Pro",
  "iPhone 13",
  "iPhone 13 mini",
  "iPhone 12 Pro Max",
  "iPhone 12 Pro",
  "iPhone 12",
  "iPhone 11 Pro Max",
  "iPhone 11 Pro",
  "iPhone 11",
  "iPhone XS Max",
  "iPhone XS",
  "iPhone XR",
  "iPhone X",
  "iPhone SE (3rd Gen)",
  "iPhone SE (2nd Gen)",
  "iPhone 8 Plus",
  "iPhone 8",
];

const STORAGE_OPTIONS = ["64GB", "128GB", "256GB", "512GB", "1TB"];

const POPULAR_COLORS = [
  "Natural Titanium",
  "Black Titanium",
  "White Titanium",
  "Desert Titanium",
  "Blue Titanium",
  "Deep Purple",
  "Space Black",
  "Sierra Blue",
  "Alpine Green",
  "Midnight",
  "Starlight",
  "Space Gray",
  "Gold",
  "Silver",
  "Product RED",
];

const QUICK_ISSUES = [
  "None / 100% Original",
  "Screen replaced (OEM)",
  "Battery replaced",
  "Back glass replaced",
  "Minor cosmetic scratches",
  "Face ID non-functional",
  "True Tone missing",
  "Camera glass scratch",
];

const STATE_CITY_SUGGESTIONS: Record<string, string[]> = {
  Lagos: [
    "Ikeja (Computer Village)",
    "Lekki Phase 1",
    "Victoria Island",
    "Surulere",
    "Yaba",
    "Festac",
    "Ajah",
    "Gbagada",
  ],
  Abuja: ["Banex (Wuse 2)", "Garki", "Maitama", "Gwarinpa", "Apo", "Wuse 1"],
  Rivers: [
    "Port Harcourt (Garrison)",
    "GRA Phase 2",
    "Trans Amadi",
    "Rumuokoro",
  ],
  Oyo: ["Ibadan (Dugbe)", "Bodija", "Ring Road", "Samonda"],
  Enugu: ["Independence Layout", "New Haven", "Ogui Road"],
  Delta: ["Warri", "Asaba"],
  Edo: ["Benin City (Ring Road)", "GRA Benin"],
  Kano: ["Kano Municipal", "Nassarawa"],
  Ogun: ["Abeokuta", "Ota"],
};

function PostNewPhonePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(pb.authStore.isValid);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successCreated, setSuccessCreated] = useState<any>(null);

  const [existingImages, setExistingImages] = useState<
    { url: string; path: string }[]
  >([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  useEffect(() => {
    setIsAuthenticated(pb.authStore.isValid);
    const unsub = pb.authStore.onChange(() => {
      setIsAuthenticated(pb.authStore.isValid);
    });
    return () => unsub();
  }, []);

  const userId = pb.authStore.record?.id;

  // Fetch verified categories from database
  const categoriesQuery = useQuery({
    queryKey: ["categories-all"],
    queryFn: async () => {
      try {
        const res = await pb.collection("categories").getFullList({
          sort: "sort_order",
          requestKey: null,
        });
        return res;
      } catch (e) {
        console.warn("Could not fetch categories list, using fallback:", e);
        return [];
      }
    },
  });

  // Fetch user store if any
  const storeQuery = useQuery({
    queryKey: ["my-store-listing", userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return null;
      try {
        const res = await pb.collection("store").getList(1, 1, {
          filter: `owner = "${userId}"`,
          requestKey: null,
        });
        return res.items.length > 0 ? res.items[0] : null;
      } catch {
        return null;
      }
    },
  });

  const availableModels = useMemo(() => {
    if (categoriesQuery.data && categoriesQuery.data.length > 0) {
      return categoriesQuery.data.map((c) => c.name);
    }
    return FALLBACK_IPHONE_MODELS;
  }, [categoriesQuery.data]);

  const methods = useForm<CreatePhoneFormValues>({
    defaultValues: {
      title: "",
      model: "iPhone 15 Pro",
      category: "",
      price: 500000,
      storage: "128GB",
      color: "Natural Titanium",
      battery_health: 90,
      condition: "flawless",
      carrier_status: "factory_unlocked",
      sim_type: "physical_sim_plus_esim",
      has_face_id: true,
      has_truetone: true,
      accepts_swap: true,
      swap_preferences: "",
      issues: "None / 100% Original",
      location_city: "Ikeja (Computer Village)",
      location_state: "Lagos",
      status: "active",
      description: "",
    },
  });

  const { register, handleSubmit, watch, setValue } = methods;
  const acceptsSwap = watch("accepts_swap");
  const selectedModel = watch("model");
  const selectedStorage = watch("storage");
  const selectedColor = watch("color");
  const selectedPrice = watch("price");
  const selectedBattery = watch("battery_health");
  const selectedCondition = watch("condition");
  const selectedCarrier = watch("carrier_status");
  const selectedCity = watch("location_city");
  const selectedState = watch("location_state");
  const selectedTitle = watch("title");

  // Keep title in sync if user hasn't explicitly customized
  useEffect(() => {
    const currentTitle = watch("title");
    if (!currentTitle || currentTitle.startsWith("iPhone")) {
      setValue("title", `${selectedModel} ${selectedStorage} ${selectedColor}`);
    }
  }, [selectedModel, selectedStorage, selectedColor, setValue, watch]);

  // Preview image URL from uploaded file
  const previewImageUrl = useMemo(() => {
    if (newFiles.length > 0) {
      return URL.createObjectURL(newFiles[0]);
    }
    return "/iphone_1.png";
  }, [newFiles]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-base-200/50 flex items-center justify-center p-4">
        <div className="bg-base-100 rounded-3xl border border-base-300 p-8 sm:p-10 max-w-md w-full text-center space-y-5 shadow-xl">
          <div className="w-16 h-16 rounded-3xl bg-primary/20 text-primary-content flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8 text-primary" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-base-content tracking-tight">
              Seller Authentication Required
            </h1>
            <p className="text-xs sm:text-sm text-base-content/70">
              Please sign in to your Swappy account to create a new iPhone
              listing and connect with buyers.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              to={"/app/auth/login?redirect=/dashboard/phones/new" as string}
              className="btn btn-primary rounded-2xl font-black w-full shadow-md text-sm"
            >
              Sign In to Post Phone
            </Link>
            <Link
              to="/dashboard"
              className="btn btn-ghost rounded-2xl font-bold w-full text-xs text-base-content/70"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: CreatePhoneFormValues) => {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const currentUserId = pb.authStore.record?.id;
      if (!currentUserId) {
        throw new Error("You must be logged in to post an iPhone listing.");
      }

      // Resolve matching category ID
      let resolvedCategoryId = "";
      if (categoriesQuery.data && categoriesQuery.data.length > 0) {
        const matched = categoriesQuery.data.find(
          (c) =>
            c.name.toLowerCase().trim() === data.model.toLowerCase().trim(),
        );
        if (matched) {
          resolvedCategoryId = matched.id;
        }
      }

      const formData = new FormData();
      formData.append("seller", currentUserId);

      // Link to seller's physical store if registered
      if (storeQuery.data?.id) {
        formData.append("store", storeQuery.data.id);
      }

      formData.append("brand", "Apple");
      if (resolvedCategoryId) {
        formData.append("category", resolvedCategoryId);
      }
      formData.append("title", data.title);
      formData.append("model", data.model);
      formData.append("price", String(Number(data.price) || 0));
      formData.append("storage", data.storage);
      formData.append("color", data.color);
      formData.append(
        "battery_health",
        String(Number(data.battery_health) || 90),
      );
      formData.append("condition", data.condition);
      formData.append("carrier_status", data.carrier_status);
      formData.append("sim_type", data.sim_type || "physical_sim_plus_esim");
      formData.append("has_face_id", String(Boolean(data.has_face_id)));
      formData.append("has_truetone", String(Boolean(data.has_truetone)));
      formData.append("accepts_swap", String(Boolean(data.accepts_swap)));
      formData.append("swap_preferences", data.swap_preferences || "");
      formData.append("issues", data.issues || "");
      formData.append("location_city", data.location_city);
      formData.append("location_state", data.location_state);
      formData.append("status", data.status || "active");
      formData.append("description", data.description || "");

      // Append all uploaded device photos
      for (const file of newFiles) {
        formData.append("images", file);
      }

      const created = await pb.collection("items").create(formData);

      queryClient.invalidateQueries({ queryKey: ["my-phones"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
      queryClient.invalidateQueries({ queryKey: ["catalog-items"] });

      setSuccessCreated(created);
      navigate({ to: "/dashboard/phones" });
    } catch (err) {
      console.error("Error creating phone listing:", err);
      setErrorMessage(extract_message(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout activeTab="listings">
      <div className="space-y-8 w-full">
        {/* Navigation & Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-base-200">
          <div className="space-y-1">
            <Link
              to="/dashboard/phones"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-base-content/65 hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to My iPhones</span>
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-base-content tracking-tight">
                Post New iPhone
              </h1>
              {storeQuery.data && (
                <span className="badge badge-primary badge-sm font-bold gap-1 inline-flex items-center">
                  <Store className="w-3 h-3" />
                  <span>{storeQuery.data.name}</span>
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-base-content/70">
              Create a transparent, verified iPhone listing with diagnostic
              specs, SIM variants, and swap terms.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/dashboard/phones"
              className="btn btn-ghost btn-sm rounded-xl font-bold text-xs"
            >
              Cancel
            </Link>
            <button
              type="submit"
              form="post-phone-form"
              disabled={isSubmitting}
              className="btn btn-primary btn-sm rounded-xl font-black text-xs inline-flex items-center gap-2 shadow-sm cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-xs" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Publish iPhone Listing</span>
                </>
              )}
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="alert alert-error rounded-3xl p-5 shadow-xs text-sm font-bold text-error-content flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successCreated && (
          <div className="alert alert-success rounded-3xl p-5 shadow-xs text-sm font-bold text-success-content flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>iPhone listed successfully! Redirecting to inventory...</span>
          </div>
        )}

        {/* Form Container */}
        <FormProvider {...methods}>
          <form
            id="post-phone-form"
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full"
          >
            {/* Left 2 Cols: Form Inputs */}
            <div className="lg:col-span-2 space-y-6">
              {/* Media Section */}
              <div className="bg-base-100 rounded-3xl border border-base-300 p-6 sm:p-7 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-base-content tracking-tight">
                      Device Photos
                    </h2>
                    <p className="text-xs sm:text-sm text-base-content/65">
                      Upload clear photos showing the screen, back glass, sides,
                      and battery health settings screen.
                    </p>
                  </div>
                  <span className="badge badge-neutral badge-sm font-bold text-xs">
                    {newFiles.length} Selected
                  </span>
                </div>

                <UpdateImages
                  images={existingImages}
                  setPrev={setExistingImages}
                  setNew={setNewFiles}
                />
              </div>

              {/* Core Information */}
              <div className="bg-base-100 rounded-3xl border border-base-300 p-6 sm:p-7 shadow-xs space-y-5">
                <div className="flex items-center gap-2 border-b border-base-200 pb-3">
                  <Smartphone className="w-4 h-4 text-primary" />
                  <h2 className="text-base sm:text-lg font-black text-base-content tracking-tight">
                    Model & Pricing
                  </h2>
                </div>

                <SimpleInput
                  label="Listing Title"
                  placeholder="e.g. iPhone 15 Pro 128GB Natural Titanium Factory Unlocked"
                  {...register("title", {
                    required: "Listing title is required",
                  })}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <LocalSelect label="iPhone Model" {...register("model")}>
                    {availableModels.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </LocalSelect>

                  <SimpleInput
                    label="Asking Price (NGN)"
                    type="number"
                    placeholder="500000"
                    {...register("price", {
                      required: "Price is required",
                      valueAsNumber: true,
                    })}
                  />
                </div>
              </div>

              {/* Hardware & Diagnostics */}
              <div className="bg-base-100 rounded-3xl border border-base-300 p-6 sm:p-7 shadow-xs space-y-5">
                <div className="flex items-center gap-2 border-b border-base-200 pb-3">
                  <Cpu className="w-4 h-4 text-secondary" />
                  <h2 className="text-base sm:text-lg font-black text-base-content tracking-tight">
                    Hardware & Diagnostic Specs
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <LocalSelect
                    label="Storage Capacity"
                    {...register("storage")}
                  >
                    {STORAGE_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </LocalSelect>

                  <div>
                    <SimpleInput
                      label="Color Finish"
                      placeholder="e.g. Natural Titanium"
                      {...register("color")}
                    />
                    {/* Quick Color Pills */}
                    <div className="flex items-center gap-1.5 flex-wrap mt-2">
                      {POPULAR_COLORS.slice(0, 6).map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setValue("color", c)}
                          className={`btn btn-xs rounded-lg text-[10px] font-semibold ${
                            selectedColor === c
                              ? "btn-primary"
                              : "btn-ghost bg-base-200/80 text-base-content/70"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <SimpleInput
                      label="Battery Health (%)"
                      type="number"
                      placeholder="89"
                      {...register("battery_health", {
                        valueAsNumber: true,
                      })}
                    />
                    {/* Quick Battery Buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap mt-2">
                      {[100, 95, 90, 85, 80].map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setValue("battery_health", b)}
                          className={`btn btn-xs rounded-lg text-[10px] font-semibold ${
                            selectedBattery === b
                              ? "btn-success text-success-content"
                              : "btn-ghost bg-base-200/80 text-base-content/70"
                          }`}
                        >
                          {b}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Condition, Carrier Lock & SIM Variant */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <LocalSelect
                    label="Cosmetic Condition"
                    {...register("condition")}
                  >
                    <option value="brand_new">Brand New (Sealed)</option>
                    <option value="open_box">Open Box / Pristine</option>
                    <option value="flawless">Flawless (No Scratches)</option>
                    <option value="good">Good (Minor Signs of Use)</option>
                    <option value="fair">
                      Fair (Visible Marks / Scratches)
                    </option>
                    <option value="cracked_screen">Cracked Glass</option>
                    <option value="for_parts">For Parts / Faulty</option>
                  </LocalSelect>

                  <LocalSelect
                    label="Carrier Lock Status"
                    {...register("carrier_status")}
                  >
                    <option value="factory_unlocked">
                      Factory Unlocked (Worldwide)
                    </option>
                    <option value="chip_unlocked">
                      Chip Unlocked (RSIM / Gevey)
                    </option>
                    <option value="network_locked">Network Locked</option>
                  </LocalSelect>

                  <LocalSelect label="SIM Variant" {...register("sim_type")}>
                    <option value="physical_sim_plus_esim">
                      Nano-SIM + eSIM
                    </option>
                    <option value="dual_physical_sim">
                      Dual Physical Nano-SIM (HK/China)
                    </option>
                    <option value="dual_esim">Dual eSIM Only (US Model)</option>
                    <option value="single_esim">Single eSIM</option>
                  </LocalSelect>
                </div>

                {/* Hardware Diagnostic Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <label className="flex items-center gap-3 p-4 rounded-2xl bg-base-200/60 border border-base-300/80 cursor-pointer hover:bg-base-200 transition-colors">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      {...register("has_face_id")}
                    />
                    <div>
                      <div className="text-xs sm:text-sm font-extrabold text-base-content">
                        Face ID Functional
                      </div>
                      <div className="text-xs text-base-content/60">
                        Biometric sensors test and unlock OK
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 rounded-2xl bg-base-200/60 border border-base-300/80 cursor-pointer hover:bg-base-200 transition-colors">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      {...register("has_truetone")}
                    />
                    <div>
                      <div className="text-xs sm:text-sm font-extrabold text-base-content">
                        True Tone Active
                      </div>
                      <div className="text-xs text-base-content/60">
                        Display calibration chip programmed
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Known Issues & Transparency */}
              <div className="bg-base-100 rounded-3xl border border-base-300 p-6 sm:p-7 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-base-200 pb-3">
                  <Wrench className="w-4 h-4 text-warning" />
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-base-content tracking-tight">
                      Disclosures & Known Issues
                    </h2>
                    <p className="text-xs text-base-content/60 mt-0.5">
                      Honest disclosures build trust and prevent deal
                      cancellations at physical inspection.
                    </p>
                  </div>
                </div>

                <SimpleInput
                  label="Known Defects or Replaced Parts"
                  placeholder="e.g. None / 100% original, or Screen changed with Apple OEM"
                  {...register("issues")}
                />

                <div className="flex items-center gap-1.5 flex-wrap">
                  {QUICK_ISSUES.map((issue) => (
                    <button
                      key={issue}
                      type="button"
                      onClick={() => setValue("issues", issue)}
                      className="btn btn-xs rounded-xl text-[11px] font-semibold btn-ghost bg-base-200 text-base-content/70 hover:bg-base-300"
                    >
                      {issue}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="bg-base-100 rounded-3xl border border-base-300 p-6 sm:p-7 shadow-xs space-y-4">
                <h2 className="text-base sm:text-lg font-black text-base-content tracking-tight">
                  Detailed Seller Notes
                </h2>
                <SimpleTextArea
                  label="Description & Included Accessories"
                  placeholder="Describe included accessories (original box, braided USB-C cable, case, receipt), battery status, or testing terms."
                  rows={4}
                  {...register("description")}
                />
              </div>
            </div>

            {/* Right 1 Col: Live Preview & Swap Policy */}
            <div className="lg:col-span-1 space-y-6">
              {/* LIVE MARKETPLACE PREVIEW */}
              <div className="bg-base-100 rounded-3xl border border-base-300 p-5 shadow-sm space-y-4 sticky top-6">
                <div className="flex items-center justify-between pb-2 border-b border-base-200">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-base-content/70">
                    <Eye className="w-4 h-4 text-primary" />
                    <span>Live Buyer Card Preview</span>
                  </div>
                  <span className="badge badge-success badge-xs font-bold">
                    Marketplace View
                  </span>
                </div>

                {/* Simulated Item Card */}
                <div className="bg-base-200/50 rounded-2xl border border-base-300 overflow-hidden shadow-xs space-y-3 p-3">
                  <div className="aspect-4/3 rounded-xl bg-base-100 border border-base-300/80 overflow-hidden relative flex items-center justify-center p-3">
                    <img
                      src={previewImageUrl}
                      alt={selectedTitle || "Preview"}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src = "/iphone_1.png";
                      }}
                    />

                    {/* Condition badge */}
                    <span className="absolute top-2 left-2 badge badge-neutral badge-xs font-bold capitalize">
                      {selectedCondition.replace(/_/g, " ")}
                    </span>

                    {/* Swap indicator */}
                    {acceptsSwap && (
                      <span className="absolute top-2 right-2 badge badge-secondary badge-xs font-bold gap-1">
                        <ArrowLeftRight className="w-2.5 h-2.5" />
                        <span>Swap OK</span>
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 px-1">
                    <h3 className="font-extrabold text-sm text-base-content truncate">
                      {selectedTitle || "iPhone Listing Title"}
                    </h3>

                    <div className="flex items-center justify-between">
                      <span className="font-black text-primary text-base font-mono">
                        ₦{(Number(selectedPrice) || 0).toLocaleString()}
                      </span>
                      <span className="badge badge-ghost badge-xs font-semibold">
                        {selectedStorage}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-base-content/65 flex-wrap pt-1">
                      {selectedBattery ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-success">
                          <BatteryCharging className="w-3.5 h-3.5" />
                          <span>{selectedBattery}%</span>
                        </span>
                      ) : null}
                      <span>&bull;</span>
                      <span className="badge badge-outline badge-xs font-semibold">
                        {selectedCarrier === "factory_unlocked"
                          ? "Unlocked"
                          : selectedCarrier.replace(/_/g, " ")}
                      </span>
                      <span>&bull;</span>
                      <span className="truncate max-w-[100px]">
                        {selectedColor}
                      </span>
                    </div>

                    <div className="text-[11px] text-base-content/60 flex items-center gap-1 pt-1 border-t border-base-300/40">
                      <MapPin className="w-3 h-3 text-primary shrink-0" />
                      <span className="truncate">
                        {selectedCity || "Ikeja"}, {selectedState || "Lagos"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Device Swap Policy */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-secondary" />
                    <span className="font-bold text-xs text-base-content">
                      Device Swap Policy
                    </span>
                  </div>

                  <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-secondary/10 border border-secondary/20 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-secondary checkbox-sm"
                      {...register("accepts_swap")}
                    />
                    <div>
                      <div className="text-xs font-black text-base-content">
                        Accept Device Swaps
                      </div>
                      <div className="text-[11px] text-base-content/70">
                        Allow buyers to trade in older models
                      </div>
                    </div>
                  </label>

                  {acceptsSwap && (
                    <div className="space-y-1.5 animate-in fade-in duration-200">
                      <SimpleTextArea
                        label="Swap Preferences"
                        placeholder="e.g. Will swap for iPhone 13 Pro + N180k cash, or iPhone 14 with 90%+ battery"
                        rows={3}
                        {...register("swap_preferences")}
                      />
                    </div>
                  )}
                </div>

                {/* Location Settings */}
                <div className="space-y-3 pt-2 border-t border-base-200">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="font-bold text-xs text-base-content">
                      Inspection Location
                    </span>
                  </div>

                  <LocalSelect label="State" {...register("location_state")}>
                    <option value="Lagos">Lagos</option>
                    <option value="Abuja">Abuja (FCT)</option>
                    <option value="Rivers">Rivers (Port Harcourt)</option>
                    <option value="Oyo">Oyo (Ibadan)</option>
                    <option value="Enugu">Enugu</option>
                    <option value="Delta">Delta</option>
                    <option value="Edo">Edo</option>
                    <option value="Kano">Kano</option>
                    <option value="Ogun">Ogun</option>
                  </LocalSelect>

                  <SimpleInput
                    label="City / Tech Market Hub"
                    placeholder="e.g. Ikeja (Computer Village)"
                    {...register("location_city", {
                      required: "City is required",
                    })}
                  />

                  {/* Quick City suggestions */}
                  {STATE_CITY_SUGGESTIONS[selectedState] && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {STATE_CITY_SUGGESTIONS[selectedState].map((city) => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => setValue("location_city", city)}
                          className="btn btn-xs rounded-lg text-[10px] font-semibold btn-ghost bg-base-200 text-base-content/70 hover:bg-base-300"
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Trust Guarantee Note */}
                <div className="bg-base-200/60 rounded-2xl border border-base-300 p-4 space-y-1.5 text-xs text-base-content/70">
                  <div className="flex items-center gap-1.5 font-bold text-base-content">
                    <ShieldCheck className="w-3.5 h-3.5 text-success" />
                    <span>Swappy Transparency</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Listings with truthful battery health ratings and accurate
                    photos receive 4x more buyer proposals and faster swap
                    deals.
                  </p>
                </div>

                {/* Primary CTA */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary btn-block h-12 rounded-2xl font-black text-sm shadow-md inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading loading-spinner loading-sm" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 stroke-[3]" />
                      <span>Publish iPhone Listing</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </DashboardLayout>
  );
}
