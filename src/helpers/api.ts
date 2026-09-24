import type { ClientResponseError } from "pocketbase";

export const extract_message = (data: ClientResponseError | any): string => {
  if (!data) return "An unknown error occurred.";
  if (typeof data === "string") return data;

  // PocketBase response direct message
  const direct_message = data?.response?.message;
  if (direct_message && typeof direct_message === "string") {
    return direct_message;
  }

  // PocketBase response nested data message
  const api_error = data?.response?.data?.message;
  if (api_error && typeof api_error === "string") {
    return api_error;
  }

  // Standard Error instance message
  if (data?.message && typeof data.message === "string" && data.message.trim() !== "") {
    return data.message;
  }

  // Cause message fallback
  if (data?.cause?.message && typeof data.cause.message === "string") {
    return data.cause.message;
  }

  // Nested PocketBase validation errors (e.g., { data: { fieldName: { message: "..." } } })
  if (data?.data && typeof data.data === "object") {
    const error_object = data.data.data || data.data;
    if (error_object && typeof error_object === "object") {
      const keys = Object.keys(error_object);
      let messages = "";
      for (const key of keys) {
        const val = error_object[key];
        const msg = typeof val === "string" ? val : val?.message;
        if (msg) {
          messages += `${key}: ${msg}\n`;
        }
      }
      if (messages.trim() !== "") {
        return messages.trim();
      }
    }
  }

  return "An unexpected error occurred.";
};
