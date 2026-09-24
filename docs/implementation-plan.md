# Swappy Implementation Plan

## 1. Overview and Product Vision

Swappy is a focused peer-to-peer marketplace and classifieds platform specifically built for buying, selling, and swapping iPhones. Inspired by Jiji, Swappy removes clutter by tailoring every category, filter, listing specification, and trade negotiation to iPhone devices.

Core user actions include:

- Discovering iPhones with targeted filters (model, storage capacity, battery health, cosmetic condition, network status, price).
- Proposing direct device swaps, cash top-ups, and outright purchases.
- Managing seller storefronts, device inventories, and verified seller profiles.
- Communicating between buyers and sellers with quick trade proposals.

---

## 2. Core Operational Rules

These fundamental rules govern all development, styling, tooling, and architectural decisions across the codebase:

1. **Always make reusable components and do not litter pages**:
   - Route files in `src/routes/` must remain lightweight and concise. They must only define loaders, metadata, layout structure, and composition of domain components.
   - Never write monolithic JSX trees or deeply nested inline markup directly in route files.
   - Decompose UI elements into modular, reusable components inside `src/components/ui/`, `src/components/catalog/`, `src/components/store/`, `src/components/items/`, and `src/components/forms/`.
   - Every repeated pattern (cards, badges, modals, table rows, filter chips, empty states, skeletons) must be extracted into a dedicated component with clear prop types.

2. **Use Bun always**:
   - Bun is the sole package manager and JavaScript runtime for this project.
   - Always run commands using `bun` (for example: `bun install`, `bun add <package>`, `bun run dev`, `bun run build`, `bunx <tool>`).
   - Never run `npm`, `yarn`, or `pnpm`.

3. **Install packages where necessary (never reinvent the wheel)**:
   - Use established, production-tested packages for common needs instead of writing bespoke, error-prone utilities.
   - Examples of approved package integrations:
     - Icons: `lucide-react` for crisp SVG icons without emojis.
     - Schema validation: `zod` for validating form inputs and API payloads.
     - HTML sanitization: `isomorphic-dompurify` for sanitizing rich text HTML fields like device specifications and issues.
     - Class merging: `clsx` and `tailwind-merge` for composable DaisyUI variant styling.
     - Database client: `pocketbase` official SDK paired with type generation.

---

## 3. UI Architecture: DaisyUI (First-Class) and Impeccable Design Guidelines

The interface follows the Impeccable design system principles, distinguishing between two primary operational modes. Full visitor and public logic specifications are detailed in [frontend-public-architecture.md](file:///home/destiny/Documents/projects/swappy-fn/docs/frontend-public-architecture.md).

### 3.1 Interface Modes

1. **Persuade Mode (Public Discovery and Landing)**
   - Target surfaces: Homepage, iPhone catalog search, public product detail pages, public store profiles.
   - Goals: Immediate visual engagement, instant scanability of device specifications (storage, battery percentage, condition badges), trust signals (verified seller tag, swap availability badge), and high-conversion calls to action.
2. **Operate Mode (User and Seller Workflows)**
   - Target surfaces: Dashboard, listing submission wizard, inventory management, trade proposal negotiation, profile settings.
   - Goals: Low cognitive overhead, clear form steppers, dense table/card views, robust validation feedback, and explicit error states.

### 3.2 DaisyUI Integration

DaisyUI v5 provides the design token foundation on top of Tailwind CSS v4.

Key DaisyUI components and conventions:

- **Navigation and Layout**: `navbar`, `drawer` for mobile filter sheets, `breadcrumbs` for catalog navigation, `footer`.
- **Display and Badges**: `card` (compact card variants for device listings), `badge` (badge-neutral for storage, badge-accent for swap offers, badge-success for verified sellers, badge-warning for defects/issues), `avatar` for seller profiles.
- **Form Controls**: `input`, `select`, `textarea`, `file-input`, `range` (for price and battery health sliders), `toggle`, `checkbox`.
- **Feedback**: `alert`, `toast`, `loading`, `skeleton` (for SSR-to-client transitions and image loading).
- **Actions and Modals**: `btn` (btn-primary, btn-secondary, btn-outline), `modal` for trade offer creation and confirmation dialogs.
- **Themes**: Clean light and dark theme parity configured via `data-theme` attribute on the root HTML element.

### 3.3 Impeccable Craft Standards

- **Typography and Hierarchy**: Clear scale hierarchy from display headers down to technical spec labels. Monospace or tabular figures for battery percentages and currency amounts.
- **Density and Scanability**: Card layouts prioritize image preview, price, model name, storage size, and battery health at a glance without visual clutter.
- **Empty and Error States**: Every listing view, search result, and dashboard list must implement tailored empty states with clear recovery actions (such as clearing search filters or creating a first listing).
- **Responsive Adaptability**: Full touch-friendly controls on mobile devices (like swipeable image galleries and bottom sheets) paired with dense grid layouts on desktop viewports.

---

## 4. PocketBase Integration

### 4.1 Schema and Generated Types

PocketBase acts as the backend database, authentication provider, and file storage engine. The complete schema specification, missing relations, and new collections are detailed in [backend-model.md](file:///home/destiny/Documents/projects/swappy-fn/docs/backend-model.md). Complete API collection endpoint mappings are detailed in [frontend-public-architecture.md](file:///home/destiny/Documents/projects/swappy-fn/docs/frontend-public-architecture.md) and [swappy_api_collection.json](file:///home/destiny/Documents/projects/swappy-fn/swappy_api_collection.json).

The TypeScript types are generated and kept up to date using:

```bash
bunx pocketbase-typegen --env
```

The output file [pocketbase-types.ts](file:///home/destiny/Documents/projects/swappy-fn/pocketbase-types.ts) defines typed interfaces for:

- `items`: iPhone listings with fields for title, price, storage, color, description, specifications (HTML), issues (HTML), battery health, condition, carrier status, swap status, created, updated.
- `store`: Seller store details containing name, slug, owner (relation to users), address, verified status, created, updated.
- `profile`: User personal information containing age, firstName, lastName, sex, email, userName, user (relation to users).
- `users`: Core authentication identity containing email, verified, avatar, tokenKey.
- Plus new collections defined in [backend-model.md](file:///home/destiny/Documents/projects/swappy-fn/docs/backend-model.md): `swap_offers`, `favorites`, `reviews`.

### 4.2 Dual-Client Architecture

To support both Server-Side Rendering (SSR) and interactive client sessions safely:

1. **Server Client (SSR / Server Functions)**:
   - Initialized per request inside TanStack Start server functions using `getSSRClient` in `src/client/pb.ts`.
   - Operates in anonymous mode for public queries, or hydrates auth cookies from incoming HTTP request headers for authenticated server operations.
   - Never shares authentication state across concurrent requests.

2. **Browser Client (Client-Side Interactions)**:
   - Singleton instance running in the browser (`pb` in `src/client/pb.ts`).
   - Manages local `authStore` with automatic cookie synchronization so that server functions receive the current session cookie on subsequent page loads.

### 4.3 Type-Safe Helper Factory

The centralized client module [src/client/pb.ts](file:///home/destiny/Documents/projects/swappy-fn/src/client/pb.ts) exports typed instances:

```typescript
import PocketBase from "pocketbase";
import type { TypedPocketBase } from "../../pocketbase-types";

export const POCKETBASE_URL =
  process.env.POCKETBASE_URL || "http://127.0.0.1:8099";

export const pb = new PocketBase(POCKETBASE_URL) as TypedPocketBase;

export function getSSRClient(cookieHeader?: string): TypedPocketBase {
  const client = new PocketBase(POCKETBASE_URL) as TypedPocketBase;
  if (cookieHeader) {
    client.authStore.loadFromCookie(cookieHeader);
  }
  return client;
}
```

---

## 5. SSR-First Architecture for Non-Auth API Calls

### 5.1 Principle

All public, unauthenticated data fetching must happen on the server during the initial request lifecycle. This guarantees optimal performance, instant First Contentful Paint, search engine indexing, and zero client-side waterfall loading spinners for visiting users.

### 5.2 TanStack Start Server Functions

Public queries are written as server functions using `createServerFn`:

1. **`fetchPublicListings`**:
   - Accepts search parameters: model, storage, minPrice, maxPrice, color, sort, page, perPage.
   - Executes `pb.collection("items").getList(page, perPage, { filter, sort })` directly against PocketBase server-side.
   - Returns sanitized listing summaries.

2. **`fetchListingById`**:
   - Fetches complete item record with specifications and issue notes.
   - Pre-fetches related store and seller profile data server-side via relation expansion.

3. **`fetchPublicStore`**:
   - Retrieves store profile along with active items belonging to that store.

### 5.3 Route Loader Integration

TanStack Router routes bind server functions directly to their route `loader`:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { fetchPublicListings } from "../server/items";

export const Route = createFileRoute("/")({
  loaderDeps: ({ search }) => ({
    query: search.q,
    storage: search.storage,
    sort: search.sort,
  }),
  loader: async ({ deps }) => {
    return await fetchPublicListings({ data: deps });
  },
  component: CatalogPage,
});
```

By binding loaders to route search parameters, filter changes trigger automatic server-side refetches while preserving browser history and shareable URLs.

### 5.4 Client-Side Auth Boundary

- Unauthenticated endpoints (catalog browsing, item inspection, public seller store views) run exclusively through SSR loaders.
- Authenticated mutations and user-specific data (creating a listing, uploading images, sending swap offers, editing store profile) execute on the client or via authenticated server actions that validate the user session.

---

## 6. Specific Technical Guidelines

### 6.1 Project Structure and Organization

- `src/routes/`: Route declarations using TanStack Router file-based conventions. Kept thin and clean.
- `src/components/ui/`: Primitive reusable UI components built on DaisyUI tokens (Button, Badge, Card, Modal, Input).
- `src/components/items/`: Reusable listing display components (`ItemCard`, `ItemGrid`, `BatteryBadge`, `ConditionBadge`).
- `src/components/catalog/`: Domain-specific reusable components (FilterSidebar, SpecGrid, SwapProposalBadge).
- `src/components/store/`: Storefront profile header, seller inventory grid, seller rating badges.
- `src/components/common/`: Common cross-cutting components (`SafetyAlert`).
- `src/server/`: Server functions powered by `createServerFn` for PocketBase queries and mutations.
- `src/client/pb.ts`: PocketBase client setup, cookie parsing, file URL generation, and auth synchronization helpers.
- `src/lib/types/`: Domain-level view models extending `pocketbase-types.ts`.
- `src/lib/stores/`: Zustand and Jotai stores for client-only transient state (filter drawer state, draft swap offers).

### 6.2 PocketBase and Type Safety Rules

- Rule 1: Always regenerate types via `bunx pocketbase-typegen --env` whenever PocketBase schema changes occur.
- Rule 2: Never use `any` when referencing PocketBase collections or record responses. Use `TypedPocketBase` and collection types from `pocketbase-types.ts`.
- Rule 3: Always sanitize rich text/HTML fields (`issues`, `specifications`) using `isomorphic-dompurify` prior to rendering to avoid Cross-Site Scripting (XSS).
- Rule 4: Handle image asset URLs using `getPBFileUrl` from `src/client/pb.ts` to guarantee CDN or static file resolution compatibility.

### 6.3 UI and Styling Rules

- Rule 5: DaisyUI classes are first-class primitives. Do not write custom CSS for elements already supported by DaisyUI (such as `btn`, `card`, `badge`, `modal`, `navbar`).
- Rule 6: No emojis in user interface components, buttons, or technical copy. Use clean icon SVGs from `lucide-react` for visual indicators.
- Rule 7: Strict accessibility compliance. Every form control must have an associated `label`, every interactive icon must have an `aria-label`, and interactive states must support keyboard focus.
- Rule 8: Dark mode and light mode must both be tested and fully legible using DaisyUI semantic color variables (`base-100`, `base-200`, `base-content`, `primary`, `neutral`).

### 6.4 State Management Rules

- Rule 9: Server state belongs in TanStack Router loaders and TanStack Query caches. Do not duplicate listing records in global client stores.
- Rule 10: Use Zustand for multi-step interactive workflows (such as the iPhone listing creation wizard or multi-device swap configuration).
- Rule 11: Use Jotai for atomic, fine-grained UI toggles (such as mobile filter sheet visibility or active gallery image index).

### 6.5 SSR and Performance Rules

- Rule 12: Public route loaders must execute on the server. Do not perform initial client-side data fetching on public catalog routes.
- Rule 13: Images must use responsive picture elements or image tags with explicit aspect ratio placeholders to prevent layout shift during loading.
- Rule 14: Route loaders must implement try-catch error boundaries and return structured error envelopes to avoid crashing full page hydration.

---

## 7. Implementation Phases

### Phase 1: Foundation and PocketBase Setup

- Configure PocketBase environment variables (`POCKETBASE_URL`).
- Implement `createPocketBaseClient` and `getSSRClient` in `src/client/pb.ts` for server and browser contexts.
- Verify `pocketbase-types.ts` type definitions and automate script runner in `package.json` with `bun`.
- Configure DaisyUI v5 plugin in `src/styles.css`.

### Phase 2: Primitive Reusable Components and Layout

- Build reusable UI primitives in `src/components/items/` (`ItemCard`, `ItemGrid`, `BatteryBadge`, `ConditionBadge`) and `src/components/common/` (`SafetyAlert`).
- Build root navigation header with search input, theme toggle, and mobile drawer in `src/components/layout/`.
- Ensure clean route shells without page clutter.

### Phase 3: SSR Public Catalog and Item Detail

- Build `fetchPublicListings` server function with model, storage, and price filters.
- Build homepage with search hero, model quick-select pills, and responsive iPhone listing grid.
- Build item details route (`/items/$id`) with SSR loader rendering device specs, battery health, seller summary, and issues disclosure.

### Phase 4: Authentication and User Profiles

- Implement login and signup routes using PocketBase `users` collection and AuthModal.
- Set up session cookie synchronization between client `pb.authStore` and Nitro SSR middleware.
- Build user profile view and edit screens using `profile` collection.

### Phase 5: Storefront and Listing Management

- Build store creation and settings workflow using `store` collection.
- Build listing creation wizard with photo uploads, storage selection, condition grading, and issue reporting.
- Build seller dashboard to view, pause, edit, and mark iPhones as sold or swapped.

### Phase 6: Swapping and Negotiation System

- Design swap proposal modal allowing a buyer to offer their device plus or minus cash adjustment.
- Add trade-in status badges on listings that accept swaps.
- Implement seller notification and offer review panel.

### Phase 7: Polish, Hardening, and Verification

- Conduct complete accessibility and contrast check across light and dark themes.
- Implement comprehensive empty states for search queries with zero matches.
- Test SSR response times and optimize query filters in PocketBase.
