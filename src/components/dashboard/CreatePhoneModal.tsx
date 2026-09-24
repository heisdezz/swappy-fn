import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Plus, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { pb } from "../../client/pb";
import { extract_message } from "../../helpers/api";
import LocalSelect from "../inputs/LocalSelect";
import SimpleInput from "../inputs/SimpleInput";
import SimpleTextArea from "../inputs/SimpleTextArea";
import UpdateImages from "../inputs/UpdateImages";

interface CreatePhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (newItem: any) => void;
}

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

export function CreatePhoneModal({
  isOpen,
  onClose,
  onCreated,
}: CreatePhoneModalProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [existingImages, setExistingImages] = useState<
    { url: string; path: string }[]
  >([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

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

  const { register, handleSubmit, watch, reset } = methods;
  const acceptsSwap = watch("accepts_swap");

  if (!isOpen) return null;

  const handleModalClose = () => {
    reset();
    setNewFiles([]);
    setExistingImages([]);
    setErrorMessage("");
    onClose();
  };

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

      if (onCreated) {
        onCreated(created);
      }
      handleModalClose();
    } catch (err) {
      console.error("Error creating phone listing:", err);
      setErrorMessage(extract_message(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-base-100 rounded-3xl border border-base-300 w-full max-w-3xl my-8 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-base-200 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-base-content tracking-tight">
              Post New iPhone
            </h2>
            <p className="text-xs text-base-content/60">
              Create a verified listing with photos, specs, and trade options
            </p>
          </div>
          <button
            type="button"
            onClick={handleModalClose}
            className="btn btn-ghost btn-sm btn-circle"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {errorMessage && (
            <div className="alert alert-error rounded-2xl text-xs font-bold text-error-content flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <FormProvider {...methods}>
            <form id="create-phone-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Photo Upload with UpdateImages */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-base-content">
                  Listing Photos
                </label>
                <UpdateImages
                  images={existingImages}
                  setPrev={setExistingImages}
                  setNew={setNewFiles}
                />
              </div>

              {/* Title & Core Specs */}
              <div className="space-y-4">
                <SimpleInput
                  label="Listing Title"
                  placeholder="e.g. iPhone 15 Pro 128GB Blue Titanium Factory Unlocked"
                  {...register("title", { required: "Listing title is required" })}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <LocalSelect label="iPhone Model" {...register("model")}>
                    {IPHONE_MODELS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </LocalSelect>

                  <LocalSelect label="Storage Capacity" {...register("storage")}>
                    {STORAGE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </LocalSelect>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <SimpleInput
                    label="Price in Naira"
                    type="number"
                    placeholder="e.g. 650000"
                    {...register("price", {
                      required: "Price is required",
                      valueAsNumber: true,
                    })}
                  />

                  <SimpleInput
                    label="Color Finish"
                    placeholder="e.g. Blue Titanium"
                    {...register("color")}
                  />

                  <SimpleInput
                    label="Battery Health (%)"
                    type="number"
                    min={50}
                    max={100}
                    placeholder="e.g. 94"
                    {...register("battery_health", { valueAsNumber: true })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <LocalSelect label="Cosmetic Condition" {...register("condition")}>
                    <option value="flawless">Flawless (No Scratches)</option>
                    <option value="open_box">Open Box (Like New)</option>
                    <option value="good">Good (Light Wear)</option>
                    <option value="fair">Fair (Visible Scuffs)</option>
                    <option value="cracked">Cracked Back Glass</option>
                  </LocalSelect>

                  <LocalSelect label="Carrier Status" {...register("carrier_status")}>
                    <option value="factory_unlocked">Factory Unlocked</option>
                    <option value="chip_unlocked">Chip Unlocked</option>
                    <option value="carrier_locked">Carrier Locked</option>
                  </LocalSelect>
                </div>
              </div>

              {/* Hardware Integrity Checks */}
              <div className="space-y-3">
                <span className="text-xs font-extrabold text-base-content">
                  Hardware Integrity Checks
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex items-center justify-between p-3.5 rounded-2xl bg-base-200/50 border border-base-300/60 cursor-pointer">
                    <div>
                      <div className="font-bold text-xs text-base-content">
                        Face ID Functional
                      </div>
                      <div className="text-[10px] text-base-content/60">
                        TrueDepth camera works
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
                        Original screen calibration
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

              {/* Trade Eligibility */}
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-base-200/50 border border-base-300/60 cursor-pointer">
                  <div>
                    <div className="font-bold text-xs text-base-content">
                      Accept Swap Offers
                    </div>
                    <div className="text-[10px] text-base-content/60">
                      Buyers can submit iPhone trade proposals with cash adjustment
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
                    placeholder="e.g. Open to trade for iPhone 13 Pro + cash addition"
                    {...register("swap_preferences")}
                  />
                )}
              </div>

              {/* Location & Description */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SimpleInput
                    label="City"
                    placeholder="e.g. Ikeja"
                    {...register("location_city")}
                  />
                  <SimpleInput
                    label="State"
                    placeholder="e.g. Lagos"
                    {...register("location_state")}
                  />
                </div>

                <SimpleTextArea
                  label="Description & Inspection Notes"
                  rows={3}
                  placeholder="Included accessories, charging cable, battery health authenticity, purchase history..."
                  {...register("description")}
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-2.5 text-xs text-base-content/80">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                <span>
                  Physical handover is recommended at verified shops in Computer Village or Banex Plaza.
                </span>
              </div>
            </form>
          </FormProvider>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-base-200 bg-base-100 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={handleModalClose}
            className="btn btn-ghost btn-sm rounded-xl font-bold text-xs"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="create-phone-form"
            disabled={isSubmitting}
            className="btn btn-primary btn-sm rounded-xl font-bold inline-flex items-center gap-1.5 shadow-sm text-xs"
          >
            {isSubmitting ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <Plus className="w-4 h-4 stroke-[3]" />
            )}
            <span>Publish Listing</span>
          </button>
        </div>
      </div>
    </div>
  );
}
