import { createServerFn } from "@tanstack/react-start";
import { getSSRClient } from "../client/pb";
import type { ItemCardRecord } from "../components/items/ItemCard";
import type {
  CategoryRecord,
  CategoryTrendingResponse,
} from "../types/categories";
import { extractIdFromSlug } from "../utils/slug";

export interface ItemDetailRecord extends ItemCardRecord {
  brand?: string;
  model?: string;
  has_face_id?: boolean;
  has_truetone?: boolean;
  promoted_tier?: string;
  status?: string;
  description?: string;
  issues?: string;
  views?: number;
  category?: string;
  seller?: {
    id: string;
    name: string;
    username?: string;
    phone?: string;
    whatsapp?: string;
    avatar?: string;
    verified?: boolean;
    rating?: number;
    completed_swaps?: number;
    member_since?: string;
  };
  store?: {
    id: string;
    name: string;
    slug: string;
    is_verified?: boolean;
    city?: string;
    state?: string;
  };
}

export interface StoreDetailRecord {
  id: string;
  name: string;
  slug: string;
  description?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  state?: string;
  is_verified?: boolean;
  logo?: string;
  banner?: string;
  item_count?: number;
  featured_items?: ItemCardRecord[];
}

function resolveDeviceImages(images: unknown, modelOrTitle = ""): string[] {
  if (Array.isArray(images) && images.length > 0) {
    return images.map(String);
  }
  const text = modelOrTitle.toLowerCase();
  if (text.includes("15") || text.includes("16")) {
    return ["/iphone_1.png"];
  }
  if (text.includes("14") || text.includes("13")) {
    return ["/iphone_13.png"];
  }
  return ["/iphone_8_x_7.png"];
}

function sanitizeRecord(item: Record<string, unknown>): ItemCardRecord {
  const title = item.title ? String(item.title) : undefined;
  const model = item.model ? String(item.model) : "";

  return {
    id: String(item.id || ""),
    collectionId: item.collectionId ? String(item.collectionId) : "items",
    collectionName: item.collectionName ? String(item.collectionName) : "items",
    title,
    price: typeof item.price === "number" ? item.price : undefined,
    storage: item.storage ? String(item.storage) : undefined,
    color: item.color ? String(item.color) : undefined,
    battery_health:
      typeof item.battery_health === "number" ? item.battery_health : undefined,
    condition: item.condition ? String(item.condition) : undefined,
    carrier_status: item.carrier_status
      ? String(item.carrier_status)
      : undefined,
    sim_type: item.sim_type ? String(item.sim_type) : undefined,
    accepts_swap:
      typeof item.accepts_swap === "boolean" ? item.accepts_swap : false,
    swap_preferences: item.swap_preferences
      ? String(item.swap_preferences)
      : undefined,
    location_city: item.location_city ? String(item.location_city) : undefined,
    location_state: item.location_state
      ? String(item.location_state)
      : undefined,
    is_promoted:
      typeof item.is_promoted === "boolean" ? item.is_promoted : false,
    images: resolveDeviceImages(item.images, title || model),
    created: item.created ? String(item.created) : undefined,
    updated: item.updated ? String(item.updated) : undefined,
  };
}

function sanitizeDetailRecord(item: Record<string, unknown>): ItemDetailRecord {
  const base = sanitizeRecord(item);
  const expand = (item.expand || {}) as Record<string, unknown>;
  const store = expand.store as Record<string, unknown> | undefined;
  const seller = expand.seller as Record<string, unknown> | undefined;

  const sellerName = store?.name
    ? String(store.name)
    : seller?.name
      ? String(seller.name)
      : "Verified Seller";

  const sellerPhone = store?.phone
    ? String(store.phone)
    : seller?.phone
      ? String(seller.phone)
      : "+2348030001234";

  const sellerWhatsapp = store?.whatsapp
    ? String(store.whatsapp).replace(/[^0-9]/g, "")
    : seller?.whatsapp
      ? String(seller.whatsapp).replace(/[^0-9]/g, "")
      : "2348030001234";

  return {
    ...base,
    brand: item.brand ? String(item.brand) : "Apple",
    model: item.model ? String(item.model) : undefined,
    has_face_id:
      typeof item.has_face_id === "boolean" ? item.has_face_id : true,
    has_truetone:
      typeof item.has_truetone === "boolean" ? item.has_truetone : true,
    promoted_tier: item.promoted_tier ? String(item.promoted_tier) : undefined,
    status: item.status ? String(item.status) : "active",
    description: item.description ? String(item.description) : undefined,
    issues: item.issues ? String(item.issues) : undefined,
    views: typeof item.views === "number" ? item.views : 142,
    category: item.category ? String(item.category) : undefined,
    seller: {
      id: seller?.id ? String(seller.id) : "usr-seller-1",
      name: sellerName,
      username: seller?.username ? String(seller.username) : undefined,
      phone: sellerPhone,
      whatsapp: sellerWhatsapp,
      avatar: seller?.avatar ? String(seller.avatar) : undefined,
      verified: true,
      rating: 4.9,
      completed_swaps: 18,
      member_since: "2023",
    },
    store: store
      ? {
          id: String(store.id),
          name: String(store.name || "Computer Village Flagship"),
          slug: String(store.slug || "flagship-store"),
          is_verified: true,
          city: store.city ? String(store.city) : undefined,
          state: store.state ? String(store.state) : undefined,
        }
      : undefined,
  };
}

export const getTrendingCategoriesFn = createServerFn({
  method: "GET",
}).handler(async (): Promise<CategoryTrendingResponse | null> => {
  const backendUrl =
    process.env.POCKETBASE_URL ||
    process.env.VITE_POCKETBASE_URL ||
    "http://127.0.0.1:8090";

  try {
    const res = await fetch(`${backendUrl}/api/categories/trending`, {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      console.warn("Could not load trending categories, status:", res.status);
      return null;
    }
    const data = (await res.json()) as CategoryTrendingResponse;
    return data;
  } catch (err) {
    console.error("Error fetching trending categories:", err);
    return null;
  }
});

export const getCategoriesFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<CategoryRecord[]> => {
    const client = getSSRClient();
    try {
      const records = await client.collection("categories").getFullList({
        sort: "sort_order",
        filter: "is_active = true",
        requestKey: null,
      });

      return records.map((c) => ({
        id: String(c.id),
        name: String(c.name),
        slug: String(c.slug),
        series: String(c.series || ""),
        variant: String(c.variant || "base"),
        release_year: Number(c.release_year || 2020),
        icon: c.icon ? String(c.icon) : "smartphone",
        description: c.description ? String(c.description) : undefined,
        sort_order: Number(c.sort_order || 0),
        is_active: Boolean(c.is_active),
      }));
    } catch (err) {
      console.error("Failed to load categories list:", err);
      return [];
    }
  },
);

export const getHomepageDataFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<{
    promoted: ItemCardRecord[];
    recent: ItemCardRecord[];
    trendingCategories: CategoryTrendingResponse | null;
  }> => {
    const pbClient = getSSRClient();

    try {
      const [promotedRes, recentRes, trendingCategories] = await Promise.all([
        pbClient.collection("items").getList(1, 8, {
          filter: 'is_promoted = true && status = "active"',
          sort: "-created",
          expand: "seller,store",
          requestKey: null,
        }),
        pbClient.collection("items").getList(1, 12, {
          filter: 'status = "active"',
          sort: "-created",
          expand: "seller,store",
          requestKey: null,
        }),
        getTrendingCategoriesFn(),
      ]);

      return {
        promoted: (promotedRes.items || []).map((item) =>
          sanitizeRecord(item as unknown as Record<string, unknown>),
        ),
        recent: (recentRes.items || []).map((item) =>
          sanitizeRecord(item as unknown as Record<string, unknown>),
        ),
        trendingCategories,
      };
    } catch (error) {
      console.error("PocketBase getHomepageDataFn query error:", error);
      return {
        promoted: [],
        recent: [],
        trendingCategories: null,
      };
    }
  },
);

export const getItemBySlugFn = createServerFn({ method: "GET" })
  .validator((d: { slug: string }) => d)
  .handler(
    async ({
      data,
    }): Promise<{
      item: ItemDetailRecord | null;
      relatedItems: ItemCardRecord[];
    }> => {
      const pbClient = getSSRClient();
      const extractedId = extractIdFromSlug(data.slug);

      try {
        let rawItem: Record<string, unknown> | null = null;

        // Try direct ID lookup if slug matches PocketBase 15-char ID
        if (extractedId && extractedId.length === 15) {
          try {
            rawItem = (await pbClient.collection("items").getOne(extractedId, {
              expand: "seller,store",
              requestKey: null,
            })) as unknown as Record<string, unknown>;
          } catch {
            rawItem = null;
          }
        }

        // If not found by direct ID, search by slug
        if (!rawItem) {
          const listRes = await pbClient.collection("items").getList(1, 1, {
            filter: `slug = "${data.slug}"`,
            expand: "seller,store",
            requestKey: null,
          });

          if (listRes.items.length > 0) {
            rawItem = listRes.items[0] as unknown as Record<string, unknown>;
          }
        }

        if (!rawItem) {
          return { item: null, relatedItems: [] };
        }

        const item = sanitizeDetailRecord(rawItem);

        // Fetch related devices
        let relatedItems: ItemCardRecord[] = [];
        try {
          const relatedRes = await pbClient.collection("items").getList(1, 4, {
            filter: `id != "${item.id}" && status = "active"`,
            sort: "-created",
            expand: "seller,store",
            requestKey: null,
          });
          relatedItems = (relatedRes.items || []).map((rel) =>
            sanitizeRecord(rel as unknown as Record<string, unknown>),
          );
        } catch (e) {
          console.warn("Could not query related items:", e);
        }

        return { item, relatedItems };
      } catch (err) {
        console.error("Error in getItemBySlugFn:", err);
        return { item: null, relatedItems: [] };
      }
    },
  );

export const getStoresFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ stores: StoreDetailRecord[] }> => {
    const pb = getSSRClient();

    try {
      const storeRes = await pb.collection("store").getList(1, 50, {
        sort: "-created",
        requestKey: null,
      });

      const storesWithItems: StoreDetailRecord[] = await Promise.all(
        (storeRes.items || []).map(async (st) => {
          const storeId = String(st.id);
          let itemCount = 0;
          let featured: ItemCardRecord[] = [];

          try {
            const itemsRes = await pb.collection("items").getList(1, 3, {
              filter: `store = "${storeId}" && status = "active"`,
              sort: "-created",
              requestKey: null,
            });
            itemCount = itemsRes.totalItems;
            featured = (itemsRes.items || []).map((item) =>
              sanitizeRecord(item as unknown as Record<string, unknown>),
            );
          } catch (e) {
            console.error(`Error loading items for store ${storeId}:`, e);
          }

          return {
            id: String(st.id),
            name: String(st.name || "Verified Store"),
            slug: String(st.slug || st.id),
            description: st.description ? String(st.description) : undefined,
            phone: st.phone ? String(st.phone) : undefined,
            whatsapp: st.whatsapp ? String(st.whatsapp) : undefined,
            address: st.address ? String(st.address) : undefined,
            city: st.city ? String(st.city) : undefined,
            state: st.state ? String(st.state) : undefined,
            is_verified:
              typeof st.is_verified === "boolean" ? st.is_verified : true,
            logo: st.logo ? String(st.logo) : undefined,
            banner: st.banner ? String(st.banner) : undefined,
            item_count: itemCount,
            featured_items: featured,
          };
        }),
      );

      return { stores: storesWithItems };
    } catch (error) {
      console.error("PocketBase getStoresFn query error:", error);
      return { stores: [] };
    }
  },
);

export const getStoreBySlugFn = createServerFn({ method: "GET" })
  .validator((data: { slug: string }) => data)
  .handler(
    async ({
      data,
    }): Promise<{
      store: StoreDetailRecord | null;
      inventory: ItemCardRecord[];
    }> => {
      const { slug } = data;
      const pb = getSSRClient();

      try {
        let storeRecord: Record<string, unknown> | null = null;

        try {
          const res = await pb
            .collection("store")
            .getFirstListItem(`slug = "${slug}" || id = "${slug}"`, {
              requestKey: null,
            });
          if (res) {
            storeRecord = res as unknown as Record<string, unknown>;
          }
        } catch {
          // Slug lookup missed
        }

        if (storeRecord) {
          const storeId = String(storeRecord.id);

          const itemsRes = await pb.collection("items").getList(1, 50, {
            filter: `store = "${storeId}" && status = "active"`,
            sort: "-created",
            expand: "seller,store",
            requestKey: null,
          });

          return {
            store: {
              id: storeId,
              name: String(storeRecord.name || "Verified Store"),
              slug: String(storeRecord.slug || storeId),
              description: storeRecord.description
                ? String(storeRecord.description)
                : undefined,
              phone: storeRecord.phone ? String(storeRecord.phone) : undefined,
              whatsapp: storeRecord.whatsapp
                ? String(storeRecord.whatsapp)
                : undefined,
              address: storeRecord.address
                ? String(storeRecord.address)
                : undefined,
              city: storeRecord.city ? String(storeRecord.city) : undefined,
              state: storeRecord.state ? String(storeRecord.state) : undefined,
              is_verified:
                typeof storeRecord.is_verified === "boolean"
                  ? storeRecord.is_verified
                  : true,
              logo: storeRecord.logo ? String(storeRecord.logo) : undefined,
              banner: storeRecord.banner
                ? String(storeRecord.banner)
                : undefined,
              item_count: itemsRes.totalItems,
            },
            inventory: (itemsRes.items || []).map((item) =>
              sanitizeRecord(item as unknown as Record<string, unknown>),
            ),
          };
        }
      } catch (error) {
        console.error(
          `PocketBase getStoreBySlugFn query error for slug '${slug}':`,
          error,
        );
      }

      return {
        store: null,
        inventory: [],
      };
    },
  );

export const getCatalogItemsFn = createServerFn({ method: "GET" })
  .validator(
    (d: {
      category?: string;
      model?: string;
      storage?: string;
      condition?: string;
      carrier?: string;
      minBattery?: number;
      acceptsSwap?: boolean;
      search?: string;
      sort?: string;
    }) => d,
  )
  .handler(
    async ({
      data,
    }): Promise<{
      items: ItemCardRecord[];
      totalCount: number;
    }> => {
      const pbClient = getSSRClient();

      const filterParts: string[] = ['status = "active"'];

      if (data.category) {
        filterParts.push(`category.slug = "${data.category}"`);
      } else if (data.model) {
        filterParts.push(
          `(model ~ "${data.model}" || title ~ "${data.model}")`,
        );
      }

      if (data.storage) {
        filterParts.push(`storage = "${data.storage}"`);
      }

      if (data.condition) {
        filterParts.push(`condition = "${data.condition}"`);
      }

      if (data.carrier) {
        filterParts.push(`carrier_status = "${data.carrier}"`);
      }

      if (typeof data.minBattery === "number" && data.minBattery > 0) {
        filterParts.push(`battery_health >= ${data.minBattery}`);
      }

      if (data.acceptsSwap) {
        filterParts.push(`accepts_swap = true`);
      }

      if (data.search) {
        filterParts.push(
          `(title ~ "${data.search}" || description ~ "${data.search}" || color ~ "${data.search}")`,
        );
      }

      let sortClause = "-created";
      if (data.sort === "price_asc") sortClause = "price, -created";
      if (data.sort === "price_desc") sortClause = "-price, -created";
      if (data.sort === "promoted") sortClause = "-is_promoted, -created";

      try {
        const res = await pbClient.collection("items").getList(1, 50, {
          filter: filterParts.join(" && "),
          sort: sortClause,
          expand: "seller,store,category",
          requestKey: null,
        });

        return {
          items: (res.items || []).map((item) =>
            sanitizeRecord(item as unknown as Record<string, unknown>),
          ),
          totalCount: res.totalItems,
        };
      } catch (err) {
        console.error("getCatalogItemsFn query error:", err);
        return { items: [], totalCount: 0 };
      }
    },
  );
