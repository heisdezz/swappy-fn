import PocketBase from "pocketbase";
import type { TypedPocketBase } from "../../pocketbase-types";

export const POCKETBASE_URL =
  (typeof process !== "undefined" && process.env?.POCKETBASE_URL) ||
  (typeof import.meta !== "undefined" &&
    (import.meta as { env?: Record<string, string> }).env
      ?.VITE_POCKETBASE_URL) ||
  "http://127.0.0.1:8090";

export const pb = new PocketBase(POCKETBASE_URL) as TypedPocketBase;
pb.autoCancellation(false);

if (typeof window !== "undefined") {
  pb.authStore.loadFromCookie(document.cookie);
  pb.authStore.onChange(() => {
    document.cookie = pb.authStore.exportToCookie({
      httpOnly: false,
      sameSite: "lax",
      secure: window.location.protocol === "https:",
    });
  });
}

export function getSSRClient(cookieHeader?: string): TypedPocketBase {
  const client = new PocketBase(POCKETBASE_URL) as TypedPocketBase;
  client.autoCancellation(false);
  if (cookieHeader) {
    client.authStore.loadFromCookie(cookieHeader);
  }
  return client;
}

export function getPBFileUrl(
  collectionIdOrName: string,
  recordId: string,
  filename: string,
  thumb?: string,
): string {
  if (!collectionIdOrName || !recordId || !filename) return "";
  const thumbParam = thumb ? `?thumb=${encodeURIComponent(thumb)}` : "";
  return `${POCKETBASE_URL}/api/files/${collectionIdOrName}/${recordId}/${filename}${thumbParam}`;
}
