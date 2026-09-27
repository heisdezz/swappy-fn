import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Save,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { pb } from "../../../client/pb";
import { DashboardLayout } from "../../../components/dashboard/DashboardLayout";
import LocalSelect from "../../../components/inputs/LocalSelect";
import SimpleInput from "../../../components/inputs/SimpleInput";
import SimpleTextArea from "../../../components/inputs/SimpleTextArea";
import UpdateImages from "../../../components/inputs/UpdateImages";
import PageLoader from "../../../components/wrappers/PageLoader";
import { extract_message } from "../../../helpers/api";
import { createItemSlug } from "../../../utils/slug";

export const Route = createFileRoute("/dashboard/phones/$id")({
  ssr: false,
  component: EditPhoneRoute,
});

interface EditPhoneFormValues {
  title: string;
  model: string;
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
  status: "active" | "paused" | "sold";
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

function EditPhoneRoute() {
  const { id } = Route.useParams();

  const itemQuery = useQuery({
    queryKey: ["phone", id],
    queryFn: () => pb.collection("items").getOne(id, { requestKey: null }),
  });

  return (
    <DashboardLayout activeTab="listings">
      <PageLoader query={itemQuery}>
        {(record) => <EditPhoneForm record={record} />}
      </PageLoader>
    </DashboardLayout>
  );
}

function EditPhoneForm({ record }: { record: any }) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const initialImages = useMemo(() => {
    if (!Array.isArray(record.images) || record.images.length === 0) {
      return [];
    }
    return record.images.map((filename: string) => {
      const isUrl = filename.startsWith("http") || filename.startsWith("/");
      return {
        url: isUrl ? filename : pb.files.getURL(record, filename),
        path: filename,
      };
    });
  }, [record]);

  const [existingImages, setExistingImages] =
    useState<{ url: string; path: string }[]>(initialImages);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const methods = useForm<EditPhoneFormValues>({
    defaultValues: {
      title: record.title || "",
      model: record.model || "iPhone 15 Pro",
      price: typeof record.price === "number" ? record.price : 450000,
      storage: record.storage || "128GB",
      color: record.color || "Natural Titanium",
      battery_health:
        typeof record.battery_health === "number" ? record.battery_health : 92,
      condition: record.condition || "flawless",
      carrier_status: record.carrier_status || "factory_unlocked",
      sim_type: record.sim_type || "physical_sim_plus_esim",
      has_face_id:
        typeof record.has_face_id === "boolean" ? record.has_face_id : true,
      has_truetone:
        typeof record.has_truetone === "boolean" ? record.has_truetone : true,
      accepts_swap:
        typeof record.accepts_swap === "boolean" ? record.accepts_swap : true,
      swap_preferences: record.swap_preferences || "",
      issues: record.issues || "None / 100% Original",
      location_city: record.location_city || "Ikeja",
      location_state: record.location_state || "Lagos",
      status: (record.status as "active" | "paused" | "sold") || "active",
      description: record.description || "",
    },
  });

  const { register, handleSubmit, watch } = methods;
  const currentTitle = watch("title");
  const acceptsSwap = watch("accepts_swap");

  const onSubmit = async (data: EditPhoneFormValues) => {
    setIsSubmitting(true);
    setErrorMessage("");
    setSaveSuccess(false);

    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("model", data.model);
      formData.append("price", String(Number(data.price)));
      formData.append("storage", data.storage);
      formData.append("color", data.color);
      formData.append("battery_health", String(Number(data.battery_health)));
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
      formData.append("status", data.status);
      formData.append("description", data.description || "");

      // Retain previous files
      for (const img of existingImages) {
        formData.append("images", img.path);
      }

      // Append newly uploaded files
      for (const file of newFiles) {
        formData.append("images", file);
      }

      await pb.collection("items").update(record.id, formData);

      queryClient.invalidateQueries({ queryKey: ["phone", record.id] });
      queryClient.invalidateQueries({ queryKey: ["my-phones"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 4000);
    } catch (err) {
      console.error("Error updating phone listing:", err);
      setErrorMessage(extract_message(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const itemSlug = createItemSlug({
    id: record.id,
    title: currentTitle || record.title || "iPhone",
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-base-200">
          <div className="space-y-1">
            <Link
              to="/dashboard/phones"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-base-content/65 hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to My Listings</span>
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black text-base-content tracking-tight">
                Edit Listing
              </h1>
              <span
                className={`badge badge-sm font-bold capitalize ${
                  record.status === "active"
                    ? "badge-success text-success-content"
                    : record.status === "sold"
                      ? "badge-neutral"
                      : "badge-warning text-warning-content"
                }`}
              >
                {record.status}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-base-content/70">
              Update photos, price adjustments, and inspection terms for this
              iPhone.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/items/${itemSlug}` as string}
              className="btn btn-ghost btn-sm rounded-xl font-bold text-xs inline-flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Public Page</span>
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-sm rounded-xl font-black text-xs inline-flex items-center gap-1.5 shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-xs" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Alerts */}
        {saveSuccess && (
          <div className="alert alert-success rounded-3xl p-4 shadow-xs text-xs sm:text-sm font-bold text-success-content flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Changes saved successfully to Swappy marketplace!</span>
          </div>
        )}

        {errorMessage && (
          <div className="alert alert-error rounded-3xl p-4 shadow-xs text-xs sm:text-sm font-bold text-error-content flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main 2 Cols */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photos Update */}
            <div className="bg-base-100 rounded-3xl border border-base-300 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-base-200">
                <h2 className="font-extrabold text-sm sm:text-base text-base-content">
                  Listing Photos
                </h2>
                <span className="text-xs text-base-content/60">
                  {existingImages.length + newFiles.length} photos
                </span>
              </div>
              <UpdateImages
                images={existingImages}
                setPrev={setExistingImages}
                setNew={setNewFiles}
              />
            </div>

            {/* Specifications Card */}
            <div className="bg-base-100 rounded-3xl border border-base-300 p-6 space-y-5 shadow-xs">
              <h2 className="font-extrabold text-sm sm:text-base text-base-content pb-2 border-b border-base-200">
                Core Specifications
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

                <LocalSelect label="Storage" {...register("storage")}>
                  {STORAGE_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </LocalSelect>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SimpleInput
                  label="Price in Naira"
                  type="number"
                  placeholder="e.g. 750000"
                  {...register("price", {
                    required: "Price is required",
                    valueAsNumber: true,
                  })}
                />

                <SimpleInput
                  label="Color Finish"
                  placeholder="e.g. Natural Titanium"
                  {...register("color")}
                />

                <SimpleInput
                  label="Battery Health (%)"
                  type="number"
                  min={50}
                  max={100}
                  placeholder="e.g. 92"
                  {...register("battery_health", { valueAsNumber: true })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <LocalSelect
                  label="Cosmetic Condition"
                  {...register("condition")}
                >
                  <option value="flawless">Flawless (No Scratches)</option>
                  <option value="open_box">Open Box (Like New)</option>
                  <option value="good">Good (Light Wear)</option>
                  <option value="fair">Fair (Visible Scuffs)</option>
                  <option value="cracked_screen">Cracked Glass</option>
                  <option value="for_parts">For Parts / Faulty</option>
                </LocalSelect>

                <LocalSelect
                  label="Carrier Status"
                  {...register("carrier_status")}
                >
                  <option value="factory_unlocked">Factory Unlocked</option>
                  <option value="chip_unlocked">Chip Unlocked</option>
                  <option value="network_locked">Carrier Locked</option>
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
            </div>

            {/* Hardware Verification Toggles */}
            <div className="bg-base-100 rounded-3xl border border-base-300 p-6 space-y-4 shadow-xs">
              <h2 className="font-extrabold text-sm sm:text-base text-base-content pb-2 border-b border-base-200">
                Hardware Integrity Checks
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-base-200/50 border border-base-300/60 cursor-pointer">
                  <div>
                    <div className="font-bold text-xs text-base-content">
                      Face ID Intact
                    </div>
                    <div className="text-[10px] text-base-content/60">
                      Biometric sensor fully functional
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary toggle-sm"
                    {...register("has_face_id")}
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-base-200/50 border border-base-300/60 cursor-pointer">
                  <div>
                    <div className="font-bold text-xs text-base-content">
                      True Tone Active
                    </div>
                    <div className="text-[10px] text-base-content/60">
                      Original display calibrated
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary toggle-sm"
                    {...register("has_truetone")}
                  />
                </label>
              </div>
            </div>

            {/* Known Issues & Disclosure */}
            <div className="bg-base-100 rounded-3xl border border-base-300 p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-2 pb-2 border-b border-base-200">
                <Wrench className="w-4 h-4 text-warning" />
                <h2 className="font-extrabold text-sm sm:text-base text-base-content">
                  Known Issues & Disclosures
                </h2>
              </div>

              <SimpleInput
                label="Defects, Past Repairs or Replaced Components"
                placeholder="e.g. None / 100% Original, or Screen replaced OEM"
                {...register("issues")}
              />
            </div>

            {/* Description & Trade Preferences */}
            <div className="bg-base-100 rounded-3xl border border-base-300 p-6 space-y-4 shadow-xs">
              <h2 className="font-extrabold text-sm sm:text-base text-base-content pb-2 border-b border-base-200">
                Trade Eligibility & Notes
              </h2>

              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-base-200/50 border border-base-300/60 cursor-pointer">
                <div>
                  <div className="font-bold text-xs text-base-content">
                    Accept Swap Offers
                  </div>
                  <div className="text-[10px] text-base-content/60">
                    Allow verified buyers to propose iPhone trade-ins
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="toggle toggle-secondary toggle-sm"
                  {...register("accepts_swap")}
                />
              </label>

              {acceptsSwap && (
                <SimpleInput
                  label="Swap Preferences"
                  placeholder="e.g. Willing to downgrade to iPhone 13 Pro with 250k cash addition"
                  {...register("swap_preferences")}
                />
              )}

              <SimpleTextArea
                label="Detailed Description"
                placeholder="Include details about cosmetic state, accessories (box, charger), and testing terms..."
                rows={4}
                {...register("description")}
              />
            </div>
          </div>

          {/* Right Column: Status & Location */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-base-100 rounded-3xl border border-base-300 p-6 space-y-4 shadow-xs">
              <h2 className="font-extrabold text-sm sm:text-base text-base-content pb-2 border-b border-base-200">
                Listing Availability
              </h2>

              <LocalSelect label="Listing Status" {...register("status")}>
                <option value="active">Active (Visible on marketplace)</option>
                <option value="paused">Paused (Temporarily hidden)</option>
                <option value="sold">Sold (Mark as deal closed)</option>
              </LocalSelect>
            </div>

            <div className="bg-base-100 rounded-3xl border border-base-300 p-6 space-y-4 shadow-xs">
              <h2 className="font-extrabold text-sm sm:text-base text-base-content pb-2 border-b border-base-200">
                Inspection Location
              </h2>

              <LocalSelect label="State" {...register("location_state")}>
                <option value="Lagos">Lagos</option>
                <option value="Abuja">Abuja</option>
                <option value="Rivers">Rivers</option>
                <option value="Oyo">Oyo</option>
                <option value="Enugu">Enugu</option>
                <option value="Delta">Delta</option>
                <option value="Edo">Edo</option>
                <option value="Kano">Kano</option>
                <option value="Ogun">Ogun</option>
              </LocalSelect>

              <SimpleInput
                label="City / Market Area"
                placeholder="e.g. Ikeja, Lekki Phase 1, Banex"
                {...register("location_city", { required: "City is required" })}
              />
            </div>

            <div className="bg-base-200/50 rounded-3xl border border-base-300 p-5 space-y-2 text-xs text-base-content/70">
              <div className="flex items-center gap-2 font-bold text-base-content">
                <ShieldCheck className="w-4 h-4 text-success" />
                <span>Swappy Quality Standard</span>
              </div>
              <p>
                Listings with accurate battery health and verified descriptions
                have a 92% higher completion rate during in-person inspection.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-block h-12 rounded-2xl font-black text-sm shadow-md inline-flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Listing Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
