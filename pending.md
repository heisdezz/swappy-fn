# What Is Left to Build ⏳

### Paystack Payments & Monetization Flow (High Priority)

- **Endpoints:**
  - `POST /api/payment/subscribe` (Pro Dealer Monthly: ₦15,000)
  - `POST /api/payment/promote` (Listing Spotlight 7 Days: ₦5,000)
  - `GET /api/payment/verify?reference={ref}` (Transaction verification)
- **Frontend UI Needed:**
  - Payment plan modal/triggers from the store hub or inventory listing cards (“Promote this iPhone”).
  - Callback page (`/payment/callback`) to handle Paystack redirect, verify reference, show animated receipt/confirmation, and unlock pro status.

---

### Dedicated Swap Proposals Route (`/dashboard/swaps`)

- Dedicated filterable table for incoming vs. outgoing swap offers with counter-offer negotiation history.

---

# Completed Features ✅

### Watchlist & Saved Items Page (Item 2) ✅

- [x] Optimistic bookmarking & PocketBase `favorites` persistence (`src/helpers/watchlist.ts`).
- [x] Heart bookmark toggle micro-interaction button (`WatchlistButton.tsx`).
- [x] Heart toggle on catalog `ItemCard.tsx` and detail page `items/$slug.tsx`.
- [x] Dedicated `/watchlist` and `/dashboard/saved` pages with live search, storage filters, sorting, and price drop alert indicators.
- [x] Dynamic Saved badge with real-time counter in `PublicNavbar.tsx` and `DashboardLayout.tsx`.

### Seller Reviews & Reputation System (Item 3) ✅

- [x] Star rating summary breakdown & reviews fetching (`src/helpers/reviews.ts`).
- [x] Interactive "Write a Review" modal with quick tags and validation (`ReviewModal.tsx`).
- [x] Rating breakdown card with percentage distribution bars & star filters (`ReviewList.tsx`).
- [x] Embedded on merchant storefronts (`/store/$slug.tsx`) and listing detail pages (`/items/$slug.tsx`).
- [x] "Rate Seller" call-to-action trigger in `SellerContactCard.tsx`.
