# Swappy Frontend Architecture: Public Marketplace and Visitor Logic

## 1. Scope and Objective

This document defines the complete frontend implementation specification for all public-facing, buyer, and visitor experiences in Swappy (non-dashboard routes).

It strictly adheres to:
- Bun runtime (`bun install`, `bun run dev`, `bun run build`, `bunx`)
- DaisyUI v5 on Tailwind CSS v4 with full light and dark theme parity (`data-theme="light"` / `data-theme="dark"`)
- No emojis across all UI components, buttons, and system copy (use `lucide-react` SVG icons exclusively)
- No em-dashes anywhere in UI copy or technical documentation
- SSR-First data architecture via TanStack Start server functions (`createServerFn`)
- Typed PocketBase SDK integration using `src/client/pb.ts` with cookie-based SSR auth state
- Reusable component architecture: pages must remain lightweight and avoid markup litter

---

## 2. Public Route Map and Information Architecture

```
/
├── /                                # Homepage (Hero, quick search, promoted slider, fresh deals)
├── /explore                         # Full smartphone catalog with multi-facet sidebar filters
├── /items/$id                       # Rich device detail page, swap trigger, contact actions
├── /store/$slug                     # Verified merchant storefront, inventory, WhatsApp lead
├── /auth/login & /auth/signup       # Dedicated auth routes (backed by AuthModal overlay)
└── /payment/callback                # Paystack redirect destination and verification handshake
```

---

## 3. PocketBase Integration and API Collection Mapping

All public and authenticated requests map directly to the endpoints in [swappy_api_collection.json](file:///home/destiny/Documents/projects/swappy-fn/swappy_api_collection.json) and use the client setup in [src/client/pb.ts](file:///home/destiny/Documents/projects/swappy-fn/src/client/pb.ts).

### 3.1 Client Setup (`src/client/pb.ts`)
- **Browser Client (`pb`)**: Singleton instance configured with automatic cookie persistence for client-side interactions.
- **SSR Client (`getSSRClient`)**: Factory function generating isolated PocketBase instances for incoming SSR requests with cookie hydration.
- **Asset Helper (`getPBFileUrl`)**: Formats CDN and file URLs for uploaded device images, store banners, and avatars.

### 3.2 Endpoint to Frontend Mapping Table

| Collection Group | API Collection Action | Method and Path | Frontend Consumer |
|---|---|---|---|
| `01. System` | Health & Status | `GET /api/health`, `GET /api/swappy/status` | SSR System check and status indicator |
| `02. Auth` | Register New User | `POST /api/auth/signup` | Signup route and AuthModal |
| `02. Auth` | Login User | `POST /api/collections/users/auth-with-password` | Login route and AuthModal |
| `02. Auth` | Current Profile | `GET /api/auth/me` | User navigation dropdown and session check |
| `03. Listings` | Browse Catalog | `GET /api/collections/items/records?filter=...` | Homepage feed and Explore catalog |
| `03. Listings` | Single Item Detail | `GET /api/collections/items/records/:id` | Item details route (`/items/$id`) |
| `03. Listings` | Increment Views | `POST /api/items/:id/view` | Item detail page view counter trigger |
| `03. Listings` | Update Status | `POST /api/items/:id/status` | Seller mark sold/swapped modal |
| `04. Swaps` | Propose Device Swap | `POST /api/swap/propose` | SwapModal negotiation wizard |
| `04. Swaps` | Respond to Offer | `POST /api/swap/:id/respond` | Seller dashboard negotiation panel |
| `05. Stores` | Get Store by Slug | `GET /api/collections/store/records?filter=...` | Merchant storefront route (`/store/$slug`) |
| `06. Watchlist` | Get / Add / Remove | `/api/collections/favorites/records` | ItemCard bookmark toggle and user watchlist |
| `07. Reviews` | Get / Submit Reviews | `/api/collections/reviews/records` | Seller profile and item detail page |
| `08. Payments` | Verify Paystack | `POST /api/payments/verify` | `/payment/callback` handshake route |

---

## 4. Route-by-Route Implementation Specifications

### 4.1 Homepage (`/`)

#### Purpose
Instant discovery of iPhones, high-conversion categories, active trade opportunities, and sponsored devices.

#### Route Structure
The route file `src/routes/index.tsx` stays strictly composed of clean, isolated components:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { getHomepageDataFn } from "../server/listings";
import { PublicNavbar } from "../components/layout/PublicNavbar";
import { HeroSection } from "../components/home/HeroSection";
import { PromotedCarousel } from "../components/home/PromotedCarousel";
import { ItemGrid } from "../components/items/ItemGrid";
import { Footer } from "../components/layout/Footer";

export const Route = createFileRoute("/")({
  loader: async () => await getHomepageDataFn(),
  component: HomePage,
});

function HomePage() {
  const { promoted, recent } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-base-100 text-base-content flex flex-col">
      <PublicNavbar />
      <main className="flex-1">
        <HeroSection />
        {promoted.length > 0 && <PromotedCarousel listings={promoted} />}
        <section className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Fresh Smartphone Deals</h2>
          </div>
          <ItemGrid listings={recent} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
```

#### SSR Server Function (`src/server/listings.ts`)
```typescript
import { createServerFn } from "@tanstack/react-start";
import { getSSRClient } from "../client/pb";

export const getHomepageDataFn = createServerFn({ method: "GET" }).handler(async () => {
  const pb = getSSRClient();

  const [promoted, recent] = await Promise.all([
    pb.collection("items").getList(1, 6, {
      filter: "status = 'active' && is_promoted = true",
      sort: "-created",
      expand: "seller,store",
    }),
    pb.collection("items").getList(1, 24, {
      filter: "status = 'active'",
      sort: "-created",
      expand: "seller,store",
    }),
  ]);

  return { promoted: promoted.items, recent: recent.items };
});
```

---

### 4.2 Smartphone Catalog and Discovery (`/explore`)

#### Purpose
Jiji-style multi-attribute filtering with real-time URL search parameter synchronization.

#### Key Interactive Filter Controls
- **Model Selector**: Checkbox group covering iPhone 11 through iPhone 16 Pro Max.
- **Storage Capacity**: Quick-select pill chips (`64GB`, `128GB`, `256GB`, `512GB`, `1TB`).
- **Battery Health Slider**: Range input (`70%` to `100%`) with numeric badge readout.
- **Cosmetic Condition**: Multi-select pills (`flawless`, `good`, `fair`, `cracked_screen`).
- **Carrier Status**: Radio options (`factory_unlocked`, `network_locked`, `chip_unlocked`).
- **Hardware Toggles**: DaisyUI toggles for `Face ID Intact` and `True Tone Active`.
- **Trade Eligibility**: Switch for `Accepts Swap Only`.
- **Location Selector**: Cascading state and city dropdowns (Lagos, Abuja, Rivers, Oyo).
- **Price Range**: Min and Max numeric inputs in Nigerian Naira (`NGN`).
- **Sorting**: Dropdown (`Promoted First`, `Price: Low to High`, `Price: High to Low`, `Newest`).

#### SSR Catalog Loader (`src/server/listings.ts`)
```typescript
export const getExploreCatalogFn = createServerFn({ method: "GET" })
  .validator((data: ExploreFilters) => data)
  .handler(async ({ data }) => {
    const pb = getSSRClient();
    const filterClauses: string[] = ["status = 'active'"];

    if (data.model) filterClauses.push(`model = "${data.model}"`);
    if (data.storage) filterClauses.push(`storage = "${data.storage}"`);
    if (data.minBattery) filterClauses.push(`battery_health >= ${data.minBattery}`);
    if (data.condition) filterClauses.push(`condition = "${data.condition}"`);
    if (data.carrierStatus) filterClauses.push(`carrier_status = "${data.carrierStatus}"`);
    if (data.acceptsSwap) filterClauses.push("accepts_swap = true");
    if (data.minPrice) filterClauses.push(`price >= ${data.minPrice}`);
    if (data.maxPrice) filterClauses.push(`price <= ${data.maxPrice}`);
    if (data.state) filterClauses.push(`location_state = "${data.state}"`);

    const result = await pb.collection("items").getList(data.page || 1, 24, {
      filter: filterClauses.join(" && "),
      sort: data.sort || "-created",
      expand: "seller,store",
    });

    return {
      items: result.items,
      totalItems: result.totalItems,
      totalPages: result.totalPages,
      page: result.page,
    };
  });
```

---

### 4.3 Smartphone Detail Page (`/items/$id`)

#### Purpose
Complete device transparency, multi-photo zoom gallery, hardware diagnostics, honest defects disclosure, seller reputation, and trade negotiation triggers.

#### Layout Grid Structure
```
+------------------------------------------+-------------------------------------+
| LEFT COLUMN (60% width)                  | RIGHT COLUMN (40% width)            |
| 1. High-Res Image Gallery and Thumbnails | 1. Device Title, Price and Badges   |
| 2. Key Specs Matrix (Storage, Battery)   | 2. Primary CTAs (Buy, Propose Swap) |
| 3. Hardware Diagnostics (Face ID, True)  | 3. Seller Card (Reputation, Badges) |
| 4. Known Flaws and Issues Disclosure     | 4. Direct WhatsApp Action Button    |
| 5. Seller Description and Trade Terms    | 5. In-Person Safety Warning Notice  |
+------------------------------------------+-------------------------------------+
```

#### Reusable Component Specifications
1. **`ImageGallery`**:
   - 4:3 aspect ratio viewport with click-to-zoom modal.
   - Horizontal thumbnail strip with active border indicator.
2. **`DeviceSpecsMatrix`**:
   - Visual grid of metric cards:
     - Battery Health: Battery indicator icon plus percentage.
     - Carrier Status: Unlock icon plus unlock status.
     - SIM Configuration: SIM card icon plus type.
     - Face ID and True Tone: Diagnostic check icons with status.
3. **`SellerContactCard`**:
   - Seller avatar, username, and verification badge.
   - Trade history summary (e.g. 4.9 rating across 28 swaps).
   - "Chat on WhatsApp" button with pre-filled message including model name, storage, and price.
   - "Call Seller" button with click-to-reveal phone masking.
4. **`SafetyInspectionBanner`**:
   - DaisyUI `alert alert-warning` advising buyers to inspect iCloud sign-out, test cameras, speakers, and Face ID before making payment.

---

### 4.4 Trade-In / Swap Proposal Modal (`SwapModal`)

#### Purpose
Four-step trade negotiation wizard triggered by clicking "Propose Swap" on any listing where `accepts_swap = true`.

#### Wizard Steps
1. **Step 1: Offered Device Details**:
   - Phone model select (iPhone 11 through iPhone 16 Pro Max).
   - Storage capacity (`64GB`, `128GB`, `256GB`, `512GB`, `1TB`).
   - Battery health percentage input.
   - Cosmetic condition grade (`flawless`, `good`, `fair`, `cracked_screen`).
   - Known flaws and defect disclosure notes.
2. **Step 2: Verification Photos**:
   - Multi-file dropzone for up to 5 clear photos (screen, back glass, camera lens, battery health settings screen).
3. **Step 3: Cash Adjustment Calculator**:
   - Selector:
     - `I will add cash` (Buyer pays top-up balance).
     - `Seller adds cash` (Downgrade trade, seller pays balance).
     - `Straight swap` (Zero cash balance).
   - Numeric input in Nigerian Naira (`NGN`).
4. **Step 4: Message and Handover Proposal**:
   - Negotiation note and preferred secure meeting venue.
   - Submission dispatches to `POST /api/swap/propose`.

---

### 4.5 Verified Merchant Storefront (`/store/$slug`)

#### Purpose
Dedicated public storefront for verified phone shops and refurbishers.

#### Features
- **Hero Banner**: Merchant banner image (`1200x300`).
- **Store Profile Header**: Store logo, verified merchant badge, physical address, city, state, operating hours.
- **Direct Action Bar**:
   - WhatsApp quick chat button.
   - Phone call button.
   - Google Maps link for in-person shop visits.
- **Store Inventory Grid**: Filterable grid displaying listings where `store = storeRecord.id && status = 'active'`.

---

### 4.6 Paystack Payment Callback (`/payment/callback`)

#### Purpose
Receives the redirect from Paystack after a seller purchases an ad promotion or subscription upgrade.

#### Handshake Sequence
1. Page loads with query parameter `?reference=REF_CODE`.
2. Component displays a DaisyUI loading spinner with status text.
3. Client dispatches `POST /api/payments/verify` with `{ reference }`.
4. On success: renders verification confirmation card, expiry details, and link to dashboard.
5. On error: renders error message with support link and payment retry button.

---

## 5. Reusable Component Inventory

To prevent page litter, all components are encapsulated into single-responsibility modules:

| Component Name | File Path | Primary DaisyUI Classes |
|---|---|---|
| `ItemCard` | `src/components/items/ItemCard.tsx` | `card bg-base-100 shadow-sm border border-base-200 hover:shadow-md` |
| `ItemGrid` | `src/components/items/ItemGrid.tsx` | `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4` |
| `ImageGallery` | `src/components/items/ImageGallery.tsx` | `aspect-4/3 rounded-2xl overflow-hidden bg-base-200` |
| `BatteryBadge` | `src/components/items/BatteryBadge.tsx` | `badge badge-sm font-semibold` (`badge-success` or `badge-warning`) |
| `ConditionBadge` | `src/components/items/ConditionBadge.tsx` | `badge badge-outline badge-sm` |
| `PromotedBadge` | `src/components/items/PromotedBadge.tsx` | `badge badge-accent badge-sm gap-1 font-bold` |
| `FilterSidebar` | `src/components/catalog/FilterSidebar.tsx` | `w-72 bg-base-100 border border-base-200 rounded-2xl p-5 space-y-6` |
| `SwapModal` | `src/components/swap/SwapModal.tsx` | `modal modal-bottom sm:modal-middle` |
| `SafetyAlert` | `src/components/common/SafetyAlert.tsx` | `alert alert-warning text-xs shadow-sm` |
| `StoreBanner` | `src/components/store/StoreBanner.tsx` | `w-full h-48 md:h-64 object-cover rounded-3xl` |
| `AuthModal` | `src/components/auth/AuthModal.tsx` | `modal backdrop-blur-sm` |

---

## 6. Implementation Verification Checklist

- [x] Bun runtime utilized for package installation and builds.
- [x] DaisyUI v5 plugin enabled in `src/styles.css`.
- [x] Typed PocketBase client in `src/client/pb.ts` supporting SSR and browser cookie synchronization.
- [x] Lucide icons installed (`lucide-react`) for SVG icons without emojis.
- [x] No emojis across all component templates, buttons, or technical copy.
- [x] No em-dashes across all documentation and copy.
- [x] Reusable component structure strictly mapped to avoid route page clutter.
