import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Plus, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { pb } from "../../client/pb";
import { extract_message } from "../../helpers/api";
import LocalSelect from "../inputs/LocalSelect";
import SimpleInput from "../inputs/SimpleInput";
import SimpleTextArea from "../inputs/SimpleTextArea";
import UpdateImages from "../inputs/UpdateImages";
import Modal from "../modals/DialogModal";

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
  "iPhone 12 Pro Max",
  "iPhone 12 Pro",
  "iPhone 12",
  "iPhone 11 Pro Max",
  "iPhone 11 Pro",
  "iPhone 11",
  "iPhone XR",
  "iPhone X",
];

const STORAGE_OPTIONS = ["64GB", "128GB", "256GB", "512GB", "1TB"];

export function CreatePhoneModal({
  isOpen,
  onClose,
  onCreated,
}: CreatePhoneModalProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const methods = useForm<CreatePhoneFormValues>({
    defaultValues: {
      title: "",
      model: IPHONE_MODELS[0],
      price: 0,
      storage: "128GB",
      color: "Space Gray",
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

  const { register, handleSubmit, reset } = methods;

  const handleModalClose = () => {
    reset();
    setNewFiles([]);
    setErrorMessage(null);
    onClose();
  };

  const onSubmit = async (values: CreatePhoneFormValues) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const userId = pb.authStore.record?.id;
    if (!userId) {
      setErrorMessage("You must be authenticated to post a device listing.");
      setIsSubmitting(false);
      return;
    }

    try {
      let storeId = "";
      try {
        const storeRes = await pb.collection("store").getList(1, 1, {
          filter: `user = "${userId}"`,
          requestKey: null,
        });
        if (storeRes.items.length > 0) {
          storeId = storeRes.items[0].id;
        }
      } catch {
        // user might not have a store record
      }

      const generatedTitle =
        values.title.trim() ||
        `${values.model} - ${values.storage} (${values.color})`;

      const formData = new FormData();
      formData.append("seller", userId);
      if (storeId) formData.append("store", storeId);
      formData.append("title", generatedTitle);
      formData.append("brand", "Apple");
      formData.append("model", values.model);
      formData.append("price", String(values.price));
      formData.append("storage", values.storage);
      formData.append("color", values.color);
      formData.append("battery_health", String(values.battery_health));
      formData.append("condition", values.condition);
      formData.append("carrier_status", values.carrier_status);
      formData.append("has_face_id", String(values.has_face_id));
      formData.append("has_truetone", String(values.has_truetone));
      formData.append("accepts_swap", String(values.accepts_swap));
      if (values.swap_preferences) {
        formData.append("swap_preferences", values.swap_preferences);
      }
      formData.append("location_city", values.location_city);
      formData.append("location_state", values.location_state);
      formData.append("status", values.status);
      formData.append("description", values.description || "");

      newFiles.forEach((file) => {
        formData.append("images", file);
      });

      const created = await pb.collection("items").create(formData);

      queryClient.invalidateQueries({ queryKey: ["phones", "my-listings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });

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

  const modalTitle = (
    <div>
      <h2 className="text-lg sm:text-xl font-black text-base-content tracking-tight">
        Post New iPhone
      </h2>
      <p className="text-xs text-base-content/60 font-normal">
        Create a verified listing with photos, specs, and trade options
      </p>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title={modalTitle}
      boxClassName="max-w-3xl"
    >
      <div className="space-y-6 pt-2">
        {errorMessage && (
          <div className="alert alert-error rounded-2xl text-xs font-bold text-error-content flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <FormProvider {...methods}>
          <form
            id="create-phone-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* Device Identity */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-base-content/60">
                1. Device Identification
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LocalSelect label="iPhone Model" {...register("model")}>
                  {IPHONE_MODELS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </LocalSelect>
                <LocalSelect label="Storage Capacity" {...register("storage")}>
                  {STORAGE_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </LocalSelect>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SimpleInput
                  label="Listing Title (Optional override)"
                  name="title"
                  placeholder="e.g. Clean UK-Used iPhone 14 Pro Max 128GB"
                />
                <SimpleInput
                  label="Color / Finish"
                  name="color"
                  placeholder="e.g. Space Black, Deep Purple"
                />
              </div>
            </div>

            {/* Pricing & Commercial */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-base-content/60">
                2. Price & Diagnostics
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SimpleInput
                  label="Asking Price (NGN)"
                  name="price"
                  type="number"
                  placeholder="650000"
                  required
                />
                <SimpleInput
                  label="Battery Health (%)"
                  name="battery_health"
                  type="number"
                  placeholder="89"
                  required
                />
                <LocalSelect
                  label="Cosmetic Condition"
                  {...register("condition")}
                >
                  <option value="brand_new">Brand New</option>
                  <option value="open_box">Open Box</option>
                  <option value="flawless">Flawless</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                </LocalSelect>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <LocalSelect
                  label="Carrier Status"
                  {...register("carrier_status")}
                >
                  <option value="factory_unlocked">Factory Unlocked</option>
                  <option value="network_locked">Network Locked</option>
                  <option value="chip_unlocked">Chip Unlocked</option>
                </LocalSelect>
                <LocalSelect label="Listing Visibility" {...register("status")}>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                </LocalSelect>
                <SimpleInput
                  label="Location (City)"
                  name="location_city"
                  placeholder="Ikeja / Wuse 2"
                />
              </div>

              {/* Hardware Toggles */}
              <div className="p-4 rounded-2xl bg-base-200/50 border border-base-300/60 flex flex-wrap gap-6 items-center">
                <label className="label cursor-pointer gap-2.5">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary checkbox-sm rounded-lg"
                    {...register("has_face_id")}
                  />
                  <span className="label-text text-xs font-bold text-base-content">
                    Face ID Functional
                  </span>
                </label>

                <label className="label cursor-pointer gap-2.5">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary checkbox-sm rounded-lg"
                    {...register("has_truetone")}
                  />
                  <span className="label-text text-xs font-bold text-base-content">
                    True Tone Active
                  </span>
                </label>

                <label className="label cursor-pointer gap-2.5">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-secondary checkbox-sm rounded-lg"
                    {...register("accepts_swap")}
                  />
                  <span className="label-text text-xs font-bold text-secondary">
                    Accepts Swap Deals
                  </span>
                </label>
              </div>
            </div>

            {/* Photos */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-base-content/60">
                3. Photos & Evidence
              </h3>
              <UpdateImages
                images={[]}
                setNew={setNewFiles}
                setPrev={() => {}}
              />
            </div>

            {/* Description & Trade Preferences */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-base-content/60">
                4. Description & Swap Notes
              </h3>
              <SimpleTextArea
                label="Public Description & Disclosures"
                name="description"
                placeholder="Disclose any cosmetic scuffs, receipt availability, or trade-in requirements..."
                rows={3}
              />
              <SimpleInput
                label="Target Swap Preference (Optional)"
                name="swap_preferences"
                placeholder="e.g. Willing to downgrade to iPhone 13 + cash balance"
              />
            </div>
          </form>
        </FormProvider>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-base-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-base-content/60">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
            <span>Inspected listings earn higher buyer trust</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleModalClose}
              className="btn btn-ghost btn-sm rounded-xl font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="create-phone-form"
              disabled={isSubmitting}
              className="btn btn-primary btn-sm rounded-xl font-bold inline-flex items-center gap-1.5 shadow-sm text-xs cursor-pointer"
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
    </Modal>
  );
}
