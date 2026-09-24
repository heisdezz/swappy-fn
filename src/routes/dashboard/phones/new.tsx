import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Plus,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
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
  price: number;
  storage: string;
  color: string;
  battery_health: number;
  condition: string;
  carrier_status: string;
  has_face_id: boolean;
  has_truetone: boolean;
  accepts_swap: boolean;
  swap_preferences: string;
  location_city: string;
  location_state: string;
  status: "active" | "paused";
  description: string;
}

const IPHONE_MODELS = [
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
];

const STORAGE_OPTIONS = ["64GB", "128GB", "256GB", "512GB", "1TB"];

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

  const methods = useForm<CreatePhoneFormValues>({
    defaultValues: {
      title: "",
      model: "iPhone 15 Pro",
      price: 500000,
      storage: "128GB",
      color: "Natural Titanium",
      battery_health: 90,
      condition: "flawless",
      carrier_status: "factory_unlocked",
      has_face_id: true,
      has_truetone: true,
      accepts_swap: true,
      swap_preferences: "",
      location_city: "Ikeja",
      location_state: "Lagos",
      status: "active",
      description: "",
    },
  });

  const { register, handleSubmit, watch, setValue } = methods;
  const acceptsSwap = watch("accepts_swap");
  const selectedModel = watch("model");
  const selectedStorage = watch("storage");

  // Auto-suggest listing title if user has not typed a custom one
  useEffect(() => {
    const currentTitle = watch("title");
    if (!currentTitle || currentTitle.startsWith("iPhone")) {
      setValue("title", `${selectedModel} ${selectedStorage}`);
    }
  }, [selectedModel, selectedStorage, setValue, watch]);

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
      const userId = pb.authStore.record?.id;
      if (!userId) {
        throw new Error("You must be logged in to post an iPhone listing.");
      }

      const formData = new FormData();
      formData.append("seller", userId);
      formData.append("title", data.title);
      formData.append("model", data.model);
      formData.append("price", String(Number(data.price)));
      formData.append("storage", data.storage);
      formData.append("color", data.color);
      formData.append("battery_health", String(Number(data.battery_health)));
      formData.append("condition", data.condition);
      formData.append("carrier_status", data.carrier_status);
      formData.append("has_face_id", String(Boolean(data.has_face_id)));
      formData.append("has_truetone", String(Boolean(data.has_truetone)));
      formData.append("accepts_swap", String(Boolean(data.accepts_swap)));
      formData.append("swap_preferences", data.swap_preferences || "");
      formData.append("location_city", data.location_city);
      formData.append("location_state", data.location_state);
      formData.append("status", data.status);
      formData.append("description", data.description || "");

      // Append all uploaded photos
      for (const file of newFiles) {
        formData.append("images", file);
      }

      const created = await pb.collection("items").create(formData);

      queryClient.invalidateQueries({ queryKey: ["my-phones"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });

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
      <div className="space-y-8">
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
            <h1 className="text-2xl sm:text-3xl font-black text-base-content tracking-tight">
              Post New iPhone
            </h1>
            <p className="text-xs sm:text-sm text-base-content/70">
              Create a transparent, verified iPhone listing with diagnostic
              specs and swap terms.
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
              className="btn btn-primary btn-sm rounded-xl font-black text-xs inline-flex items-center gap-2 shadow-sm"
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
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Left 2 Cols: Listing Details & Specs */}
            <div className="lg:col-span-2 space-y-6">
              {/* Media Section */}
              <div className="bg-base-100 rounded-3xl border border-base-300 p-6 sm:p-7 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-base-content tracking-tight">
                      Device Photos
                    </h2>
                    <p className="text-xs sm:text-sm text-base-content/65">
                      Upload clear photos showing the screen, back glass, and
                      battery health settings screen.
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
                <h2 className="text-base sm:text-lg font-black text-base-content tracking-tight">
                  Listing Title & Pricing
                </h2>

                <SimpleInput
                  label="Listing Title"
                  placeholder="e.g. iPhone 15 Pro 128GB Natural Titanium Factory Unlocked"
                  {...register("title", {
                    required: "Listing title is required",
                  })}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <LocalSelect label="iPhone Model" {...register("model")}>
                    {IPHONE_MODELS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </LocalSelect>

                  <SimpleInput
                    label="Price (NGN)"
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
                <h2 className="text-base sm:text-lg font-black text-base-content tracking-tight">
                  Hardware & Diagnostic Specs
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <LocalSelect label="Storage" {...register("storage")}>
                    {STORAGE_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </LocalSelect>

                  <SimpleInput
                    label="Color Finish"
                    placeholder="e.g. Natural Titanium, Deep Purple"
                    {...register("color")}
                  />

                  <SimpleInput
                    label="Battery Health (%)"
                    type="number"
                    placeholder="89"
                    {...register("battery_health", {
                      valueAsNumber: true,
                    })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                </div>

                {/* Hardware Diagnostic Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
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
                        Biometric sensors test OK
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
                        Original display programmed
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="bg-base-100 rounded-3xl border border-base-300 p-6 sm:p-7 shadow-xs space-y-4">
                <h2 className="text-base sm:text-lg font-black text-base-content tracking-tight">
                  Detailed Description
                </h2>
                <SimpleTextArea
                  label="Seller Notes"
                  placeholder="Describe included accessories (box, original charger, case), receipt availability, or known issues."
                  rows={4}
                  {...register("description")}
                />
              </div>
            </div>

            {/* Right 1 Col: Swap Preferences & Location */}
            <div className="lg:col-span-1 space-y-6">
              {/* Swap Terms Card */}
              <div className="bg-base-100 rounded-3xl border border-base-300 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-secondary" />
                  <h2 className="text-base sm:text-lg font-black text-base-content tracking-tight">
                    Device Swap Policy
                  </h2>
                </div>

                <label className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/10 border border-secondary/20 cursor-pointer">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-secondary"
                    {...register("accepts_swap")}
                  />
                  <div>
                    <div className="text-xs sm:text-sm font-extrabold text-base-content">
                      Accept Device Swaps
                    </div>
                    <div className="text-xs text-base-content/70">
                      Buyers can submit iPhone trade-ins with cash adjustments
                    </div>
                  </div>
                </label>

                {acceptsSwap && (
                  <div className="space-y-2 pt-2">
                    <SimpleTextArea
                      label="Swap Preferences"
                      placeholder="e.g. Will swap for iPhone 13 Pro + N180k cash, or iPhone 14 with 90%+ battery"
                      rows={3}
                      {...register("swap_preferences")}
                    />
                  </div>
                )}
              </div>

              {/* Location Card */}
              <div className="bg-base-100 rounded-3xl border border-base-300 p-6 shadow-xs space-y-4">
                <h2 className="text-base sm:text-lg font-black text-base-content tracking-tight">
                  Inspection Location
                </h2>
                <div className="space-y-4">
                  <SimpleInput
                    label="City / Area"
                    placeholder="e.g. Ikeja, Lekki Phase 1, Wuse 2"
                    {...register("location_city", {
                      required: "City is required",
                    })}
                  />

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
                </div>
              </div>

              {/* Trust Badge */}
              <div className="bg-base-200/60 rounded-3xl border border-base-300 p-5 space-y-2 text-xs text-base-content/70">
                <div className="flex items-center gap-2 font-extrabold text-sm text-base-content">
                  <ShieldCheck className="w-4 h-4 text-accent" />
                  <span>Swappy Seller Guarantee</span>
                </div>
                <p className="leading-relaxed">
                  Listings with truthful battery health ratings and accurate
                  photos receive 4x more buyer proposals and faster swap deals.
                </p>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary btn-block h-12 rounded-2xl font-black text-sm sm:text-base shadow-sm inline-flex items-center justify-center gap-2"
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
          </form>
        </FormProvider>
      </div>
    </DashboardLayout>
  );
}
