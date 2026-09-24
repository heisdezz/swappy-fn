import { getPBFileUrl } from "../client/pb";

export interface ResolvableRecord {
  id?: string;
  collectionId?: string;
  collectionName?: string;
  images?: string[] | null;
  [key: string]: any;
}

/**
 * Returns a fallback placeholder image based on model or title name.
 */
export function getDeviceFallbackImage(modelOrTitle = ""): string {
  const text = (modelOrTitle || "").toLowerCase();
  if (text.includes("15") || text.includes("16")) {
    return "/iphone_1.png";
  }
  if (text.includes("14") || text.includes("13")) {
    return "/iphone_13.png";
  }
  return "/iphone_8_x_7.png";
}

/**
 * Resolves a single image string into a displayable URL:
 * - If already a full URL or absolute path (/... or http...), return as-is.
 * - If a filename and record context (id and collection) is provided, resolves to PocketBase file URL.
 * - Otherwise, returns the fallback image or empty string.
 */
export function getImageUrl(
  image?: string | null,
  record?: { id?: string; collectionId?: string; collectionName?: string },
  fallback = "/iphone_1.png",
  thumb?: string,
): string {
  if (!image || typeof image !== "string") {
    return fallback;
  }

  const trimmed = image.trim();
  if (!trimmed) {
    return fallback;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/") || trimmed.startsWith("blob:") || trimmed.startsWith("data:")) {
    return trimmed;
  }

  const recordId = record?.id;
  const collection = record?.collectionName || record?.collectionId || "items";

  if (recordId && collection) {
    return getPBFileUrl(collection, recordId, trimmed, thumb);
  }

  return fallback;
}

/**
 * Resolves the primary/first thumbnail image for an item card or listing record.
 * Handles string[], single image, or missing images gracefully with fallback placeholder.
 */
export function getItemCardImageUrl(
  item: ResolvableRecord,
  thumb = "400x300",
): string {
  const fallback = getDeviceFallbackImage(item.title || item.model || "");

  if (!item) {
    return fallback;
  }

  let filename: string | undefined;

  if (Array.isArray(item.images) && item.images.length > 0) {
    filename = item.images[0];
  } else if (typeof item.images === "string" && item.images) {
    filename = item.images;
  } else if (typeof item.image === "string" && item.image) {
    filename = item.image;
  }

  if (!filename) {
    return fallback;
  }

  return getImageUrl(
    filename,
    {
      id: item.id,
      collectionId: item.collectionId,
      collectionName: item.collectionName || "items",
    },
    fallback,
    thumb,
  );
}

/**
 * Resolves an array of image URLs for an item (e.g. for photo galleries or inspection carousels).
 */
export function getItemImageUrls(
  item: ResolvableRecord,
  thumb?: string,
): string[] {
  const fallback = getDeviceFallbackImage(item?.title || item?.model || "");
  if (!item) {
    return [fallback];
  }

  let imagesList: string[] = [];
  if (Array.isArray(item.images) && item.images.length > 0) {
    imagesList = item.images;
  } else if (typeof item.images === "string" && item.images) {
    imagesList = [item.images];
  }

  if (imagesList.length === 0) {
    return [fallback];
  }

  return imagesList.map((img) =>
    getImageUrl(
      img,
      {
        id: item.id,
        collectionId: item.collectionId,
        collectionName: item.collectionName || "items",
      },
      fallback,
      thumb,
    ),
  );
}

/**
 * Resolves a store logo or banner image URL.
 */
export function getStoreImageUrl(
  store: { id?: string; collectionId?: string; collectionName?: string; [key: string]: any },
  imageField: "logo" | "banner",
  fallback = "",
  thumb?: string,
): string {
  if (!store) return fallback;
  const filename = store[imageField];
  if (!filename || typeof filename !== "string") return fallback;

  return getImageUrl(
    filename,
    {
      id: store.id,
      collectionId: store.collectionId,
      collectionName: store.collectionName || "store",
    },
    fallback,
    thumb,
  );
}
