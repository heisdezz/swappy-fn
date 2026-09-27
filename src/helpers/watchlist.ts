import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useCallback } from "react";
import { pb } from "../client/pb";
import type { ItemCardRecord } from "../components/items/ItemCard";

const LOCAL_STORAGE_KEY = "swappy_watchlist_items";

// Helper to read localStorage safely
export function getLocalWatchlist(): ItemCardRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn("Failed to read watchlist from localStorage", e);
    return [];
  }
}

// Helper to save to localStorage
export function saveLocalWatchlist(items: ItemCardRecord[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn("Failed to save watchlist to localStorage", e);
  }
}

export function useWatchlist() {
  const queryClient = useQueryClient();
  const [localItems, setLocalItems] = useState<ItemCardRecord[]>([]);
  const userId = pb.authStore.record?.id;

  // Sync initial state from localStorage
  useEffect(() => {
    setLocalItems(getLocalWatchlist());

    const handleStorageChange = () => {
      setLocalItems(getLocalWatchlist());
    };

    window.addEventListener("swappy_watchlist_updated", handleStorageChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(
        "swappy_watchlist_updated",
        handleStorageChange,
      );
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Remote PocketBase favorites query
  const remoteQuery = useQuery({
    queryKey: ["watchlist", userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return [];
      try {
        const records = await pb.collection("favorites").getFullList({
          filter: `user = "${userId}"`,
          expand: "item,item.store",
          sort: "-created",
          requestKey: null,
        });

        const items: ItemCardRecord[] = records
          .map((rec) => {
            const item = (rec.expand as any)?.item;
            if (!item) return null;
            return {
              ...item,
              favoriteRecordId: rec.id,
            };
          })
          .filter(Boolean) as ItemCardRecord[];

        // Sync remote to local so guest-to-auth works seamlessly
        if (items.length > 0) {
          saveLocalWatchlist(items);
        }

        return items;
      } catch (err) {
        console.warn("Failed to fetch remote favorites, using local:", err);
        return getLocalWatchlist();
      }
    },
  });

  // Effective watchlist: prefer remote data if authenticated and loaded, else local
  const items: ItemCardRecord[] =
    userId && remoteQuery.data ? remoteQuery.data : localItems;

  const isSaved = useCallback(
    (itemId?: string) => {
      if (!itemId) return false;
      return items.some((i) => i.id === itemId);
    },
    [items],
  );

  // Toggle item in watchlist
  const toggleMutation = useMutation({
    mutationFn: async (item: ItemCardRecord) => {
      const alreadySaved = items.some((i) => i.id === item.id);
      let updated: ItemCardRecord[] = [];

      if (alreadySaved) {
        updated = items.filter((i) => i.id !== item.id);
      } else {
        updated = [item, ...items.filter((i) => i.id !== item.id)];
      }

      // Optimistically update local storage and notify listeners immediately
      saveLocalWatchlist(updated);
      setLocalItems(updated);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("swappy_watchlist_updated"));
      }

      // If user is authenticated, sync with PocketBase `favorites` collection
      if (userId && item.id) {
        try {
          if (alreadySaved) {
            // Find existing favorite record in PocketBase
            const existing = await pb.collection("favorites").getList(1, 1, {
              filter: `user = "${userId}" && item = "${item.id}"`,
              requestKey: null,
            });
            if (existing.items.length > 0) {
              await pb.collection("favorites").delete(existing.items[0].id);
            }
          } else {
            await pb.collection("favorites").create({
              user: userId,
              item: item.id,
            });
          }
        } catch (pbErr) {
          console.warn("Remote watchlist sync warning:", pbErr);
        }
      }

      return { item, action: alreadySaved ? "removed" : "added" };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });

  const toggleWatchlist = (item: ItemCardRecord) => {
    return toggleMutation.mutateAsync(item);
  };

  return {
    watchlist: items,
    count: items.length,
    isSaved,
    toggleWatchlist,
    isLoading: remoteQuery.isLoading,
  };
}
