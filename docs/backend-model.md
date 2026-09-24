# Swappy Backend Model and Schema Specification

## 1. Executive Summary

This document defines the complete backend data architecture for Swappy. It builds directly upon the existing schema reflected in [pocketbase-types.ts](file:///home/destiny/Documents/projects/swappy-fn/pocketbase-types.ts), identifies critical missing fields and relations, and introduces dedicated collections required for a peer-to-peer iPhone classifieds and device swapping platform.

---

## 2. Current Schema Audit

The existing generated types in [pocketbase-types.ts](file:///home/destiny/Documents/projects/swappy-fn/pocketbase-types.ts) define four primary application collections:

1. `users`: System auth collection with `avatar`, `email`, `verified`.
2. `profile`: Contains `firstName`, `lastName`, `age`, `sex`, `email`, `userName`, and relation `user`.
3. `store`: Contains `name` and relation `owner` pointing to `users`.
4. `items`: Contains `title`, `price`, `color`, `storage`, `description`, `specifications` (HTML), `issues` (HTML).

### Identified Deficiencies in Current Schema
- **No Ownership on Items**: The `items` collection currently lacks a relation to `users` (seller) or `store`. Without this, listings cannot be attributed to sellers or protected by ownership permissions.
- **No Image Attachments on Items**: `items` has no image file fields. A visual marketplace like Jiji requires multiple device photographs.
- **Missing iPhone Domain Attributes**: Critical buying criteria for iPhones are absent, specifically battery health percentage, physical condition grade, SIM and carrier status, and warranty status.
- **No Swapping Mechanism**: The defining value proposition of Swappy is device swapping, yet no data structures exist to represent trade proposals, swap valuations, or cash balance adjustments.
- **No Social or Trust Layer**: Missing seller verification indicators, ratings, reviews, and buyer-seller messaging.
- **No Saved Items or Watchlist**: Users cannot bookmark listings for later review.

---

## 3. Complete Entity Relationship Overview

```
users (Auth Collection)
  ├── 1:1 ── profile (User identity and personal details)
  ├── 1:1 ── store (Optional merchant storefront)
  ├── 1:N ── items (Listings created by this user/store)
  ├── 1:N ── swap_offers [proposer] (Offers submitted by this user)
  ├── 1:N ── swap_offers [receiver] (Offers received by this user)
  ├── 1:N ── messages (Direct negotiation messages)
  ├── 1:N ── favorites (Bookmarked device listings)
  └── 1:N ── reviews [author / target]

items (iPhone Listings)
  ├── belongs to ── users [seller]
  ├── belongs to ── store [store] (Optional)
  ├── 1:N ── item_images (Multiple device photos)
  ├── 1:N ── swap_offers (Incoming swap proposals for this device)
  └── 1:N ── favorites

swap_offers (Trade Proposals)
  ├── belongs to ── items [target_item]
  ├── belongs to ── users [proposer]
  ├── belongs to ── users [seller]
  └── 1:N ── swap_images (Photos of the offered trade device)
```

---

## 4. Collection Specifications

### 4.1 Collection: `users` (System Auth)
Maintains authentication credentials and core account status.

| Field Name | Type | Required | Description |
|---|---|---|---|
| `id` | RecordId | Yes | System unique identifier |
| `email` | Email | Yes | Login email address |
| `emailVisibility` | Bool | Yes | Controls public visibility of email |
| `verified` | Bool | Yes | Email verification state |
| `avatar` | File | No | Profile avatar image |
| `role` | Select | Yes | User access level: `user`, `verified_seller`, `admin` (Default: `user`) |
| `phone` | Text | No | Contact phone number for SMS or WhatsApp negotiations |
| `phone_verified` | Bool | Yes | Phone verification status (Default: false) |

**PocketBase API Rules:**
- List / Search: `@request.auth.id != ""`
- View: `@request.auth.id != ""`
- Create: Public (Signup)
- Update: `id = @request.auth.id`
- Delete: `id = @request.auth.id`

---

### 4.2 Collection: `profile`
Extended public and personal profile data linked to a user account.

| Field Name | Type | Required | Description |
|---|---|---|---|
| `id` | RecordId | Yes | System unique identifier |
| `user` | Relation (`users`) | Yes | Unique 1:1 relationship to the auth user |
| `userName` | Text | Yes | Public handle or username (Unique index) |
| `firstName` | Text | No | User first name |
| `lastName` | Text | No | User last name |
| `age` | Number | No | User age |
| `sex` | Select | No | Options: `male`, `female`, `undisclosed` |
| `location_state` | Text | No | State or province (for local physical trades) |
| `location_city` | Text | No | City or town |
| `bio` | Text | No | Brief bio or trade terms |
| `total_swaps` | Number | Yes | Count of successfully completed trades (Default: 0) |
| `rating_average` | Number | Yes | Seller/trader rating average (0.00 to 5.00, Default: 0) |
| `rating_count` | Number | Yes | Total review count (Default: 0) |

**PocketBase API Rules:**
- List / Search: Public (for displaying seller cards)
- View: Public
- Create: `@request.auth.id != "" && @request.data.user = @request.auth.id`
- Update: `user = @request.auth.id`
- Delete: `@request.auth.role = "admin"`

---

### 4.3 Collection: `store`
Public merchant storefront for high-volume device dealers and verified repair shops.

| Field Name | Type | Required | Description |
|---|---|---|---|
| `id` | RecordId | Yes | System unique identifier |
| `owner` | Relation (`users`) | Yes | Merchant user reference (Unique index) |
| `name` | Text | Yes | Store business name |
| `slug` | Text | Yes | URL-friendly unique slug (Unique index) |
| `description` | Text | No | Store bio, return policies, and inspection guarantees |
| `logo` | File | No | Store brand logo |
| `banner` | File | No | Storefront header banner |
| `is_verified` | Bool | Yes | Administrative verification checkmark (Default: false) |
| `address` | Text | No | Physical shop address for in-person device testing |
| `city` | Text | No | Physical shop city |
| `state` | Text | No | Physical shop state |
| `whatsapp` | Text | No | Direct WhatsApp chat contact |
| `phone` | Text | No | Customer service phone number |

**PocketBase API Rules:**
- List / Search: Public (SSR-friendly)
- View: Public (SSR-friendly)
- Create: `@request.auth.id != ""`
- Update: `owner = @request.auth.id`
- Delete: `owner = @request.auth.id || @request.auth.role = "admin"`

---

### 4.4 Collection: `items` (Enhanced)
The core iPhone marketplace listings. Every listing represents a specific device for sale, trade, or both.

| Field Name | Type | Required | Description |
|---|---|---|---|
| `id` | RecordId | Yes | System unique identifier |
| `seller` | Relation (`users`) | Yes | User who posted the listing |
| `store` | Relation (`store`) | No | Optional store attribution if posted from a store account |
| `title` | Text | Yes | Listing title (for example: "iPhone 14 Pro 128GB Deep Purple") |
| `model` | Select | Yes | Standardized iPhone model identifier |
| `storage` | Select | Yes | Options: `64GB`, `128GB`, `256GB`, `512GB`, `1TB` |
| `color` | Text | Yes | Official or recognized device color name |
| `battery_health` | Number | Yes | Battery health percentage (1 to 100) |
| `condition` | Select | Yes | Options: `brand_new`, `open_box`, `flawless`, `good`, `fair`, `cracked_screen`, `for_parts` |
| `carrier_status` | Select | Yes | Options: `factory_unlocked`, `network_locked`, `chip_unlocked` |
| `sim_type` | Select | Yes | Options: `physical_sim_plus_esim`, `dual_physical_sim`, `dual_esim_only` |
| `has_face_id` | Bool | Yes | Face ID operational status (Default: true) |
| `has_truetone` | Bool | Yes | TrueTone operational status (Default: true) |
| `price` | Number | Yes | Outright purchase price in local currency |
| `accepts_swap` | Bool | Yes | Flag indicating whether seller accepts device swaps (Default: true) |
| `swap_preferences` | Text | No | Desired swap models and cash balance requirements |
| `description` | Text | No | General seller description |
| `specifications` | HTML | No | Formatted technical highlights |
| `issues` | HTML | No | Honest disclosure of defects, scratches, or replaced components |
| `images` | File (Multiple) | Yes | Photographs of device exterior, screen, and battery settings |
| `location_state` | Text | Yes | State where device is available for handover |
| `location_city` | Text | Yes | City where device is available for handover |
| `status` | Select | Yes | Options: `active`, `pending_swap`, `sold`, `swapped`, `draft`, `archived` |
| `views_count` | Number | Yes | Total page views (Default: 0) |

**PocketBase API Rules:**
- List / Search: `status = "active"` (Public SSR)
- View: `status = "active" || @request.auth.id = seller` (Public SSR)
- Create: `@request.auth.id != "" && @request.data.seller = @request.auth.id`
- Update: `seller = @request.auth.id`
- Delete: `seller = @request.auth.id || @request.auth.role = "admin"`

---

### 4.5 Collection: `swap_offers` (New Core Feature)
Manages peer-to-peer device trade-in proposals.

| Field Name | Type | Required | Description |
|---|---|---|---|
| `id` | RecordId | Yes | System unique identifier |
| `target_item` | Relation (`items`) | Yes | The listed device being negotiated |
| `seller` | Relation (`users`) | Yes | Owner of the target item |
| `proposer` | Relation (`users`) | Yes | User offering their device in exchange |
| `offered_model` | Select | Yes | iPhone model offered by proposer |
| `offered_storage` | Select | Yes | Storage capacity of offered device |
| `offered_color` | Text | No | Color of offered device |
| `offered_battery` | Number | Yes | Battery health percentage of offered device |
| `offered_condition` | Select | Yes | Physical condition of offered device |
| `offered_issues` | Text | No | Disclosed defects on the offered device |
| `offered_images` | File (Multiple) | Yes | Photos proving condition and battery settings |
| `cash_adjustment` | Number | Yes | Cash balance (Positive: proposer adds cash, Negative: seller adds cash, 0: direct 1:1 trade) |
| `message` | Text | No | Introductory proposal note |
| `status` | Select | Yes | Options: `pending`, `accepted`, `rejected`, `countered`, `completed`, `cancelled` (Default: `pending`) |

**PocketBase API Rules:**
- List / Search: `@request.auth.id = proposer || @request.auth.id = seller`
- View: `@request.auth.id = proposer || @request.auth.id = seller`
- Create: `@request.auth.id != "" && @request.data.proposer = @request.auth.id && @request.data.target_item.seller != @request.auth.id`
- Update: `@request.auth.id = proposer || @request.auth.id = seller`
- Delete: `@request.auth.id = proposer && status = "pending"`

---

### 4.6 Collection: `favorites` (New)
Allows users to save iPhone listings to their personal watchlist.

| Field Name | Type | Required | Description |
|---|---|---|---|
| `id` | RecordId | Yes | System unique identifier |
| `user` | Relation (`users`) | Yes | Owner of the favorite record |
| `item` | Relation (`items`) | Yes | Saved iPhone listing |

**PocketBase API Rules:**
- List / Search: `@request.auth.id = user`
- View: `@request.auth.id = user`
- Create: `@request.auth.id != "" && @request.data.user = @request.auth.id`
- Delete: `@request.auth.id = user`

---

### 4.7 Collection: `reviews` (New)
Peer-to-peer reputation and post-deal rating system.

| Field Name | Type | Required | Description |
|---|---|---|---|
| `id` | RecordId | Yes | System unique identifier |
| `author` | Relation (`users`) | Yes | User writing the review |
| `target_user` | Relation (`users`) | Yes | User receiving the review |
| `item` | Relation (`items`) | No | Associated transaction listing |
| `rating` | Number | Yes | Rating score from 1 to 5 |
| `comment` | Text | No | Written review feedback |

**PocketBase API Rules:**
- List / Search: Public (SSR-friendly for seller credibility)
- View: Public
- Create: `@request.auth.id != "" && @request.data.author = @request.auth.id && @request.data.target_user != @request.auth.id`
- Update: `@request.auth.id = author`
- Delete: `@request.auth.id = author || @request.auth.role = "admin"`

---

## 5. Indexes and Query Performance

To ensure sub-millisecond query execution during SSR operations and public catalog filtering:

1. **`items` Indexes**:
   - `CREATE INDEX idx_items_status_created ON items (status, created DESC);`
   - `CREATE INDEX idx_items_model_storage ON items (model, storage, status);`
   - `CREATE INDEX idx_items_price ON items (price ASC, status);`
   - `CREATE INDEX idx_items_seller ON items (seller, status);`
   - `CREATE INDEX idx_items_store ON items (store, status);`

2. **`store` Indexes**:
   - `CREATE UNIQUE INDEX idx_store_slug ON store (slug);`
   - `CREATE UNIQUE INDEX idx_store_owner ON store (owner);`

3. **`swap_offers` Indexes**:
   - `CREATE INDEX idx_swap_target ON swap_offers (target_item, status);`
   - `CREATE INDEX idx_swap_proposer ON swap_offers (proposer, status);`
   - `CREATE INDEX idx_swap_seller ON swap_offers (seller, status);`

4. **`favorites` Indexes**:
   - `CREATE UNIQUE INDEX idx_favorites_user_item ON favorites (user, item);`

---

## 6. Type Generation Workflow

Whenever the PocketBase collections or schema rules are altered:

1. Update the PocketBase instance schemas via the PocketBase admin UI or migration scripts.
2. Execute the type generator using Bun:
   ```bash
   bunx pocketbase-typegen --env
   ```
3. Verify that the updated types are written to [pocketbase-types.ts](file:///home/destiny/Documents/projects/swappy-fn/pocketbase-types.ts).
4. Run project type checking to validate full codebase compatibility:
   ```bash
   bun run typecheck
   ```

---

## 7. Migration and Implementation Steps

1. **Step 1 (Schema Patch)**:
   - Add missing `seller` (relation to `users`) and `images` (file, multiple) to the existing `items` collection.
   - Add `battery_health`, `condition`, `carrier_status`, `sim_type`, `has_face_id`, `has_truetone`, `accepts_swap`, and `status` to `items`.
   - Add `slug`, `is_verified`, and contact fields to `store`.

2. **Step 2 (Collection Additions)**:
   - Create the `swap_offers` collection with relation pointers to `items` and `users`.
   - Create the `favorites` collection with unique compound constraint on `(user, item)`.
   - Create the `reviews` collection with relation pointers to `author` and `target_user`.

3. **Step 3 (API Rules Configuration)**:
   - Apply the documented access rules so public catalog browsing is permitted without authentication, while mutations enforce request authentication and resource ownership.

4. **Step 4 (Type Regeneration)**:
   - Run `bunx pocketbase-typegen --env` to produce the updated TypeScript definitions.
