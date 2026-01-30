# Contract / Lot / Posting Functionality — Workflow & File Reference

**Generated:** January 2026  
**Scope:** Buyer portal (Aeronomy SAF Marketplace) — lots, bids, contracts, and related UI.

This document describes **workflows**, **data flow**, and **file locations** for every user-facing action. Use it to trace where logic lives and how requests move through the stack.

---

## 0. Quick reference: Action → main files

| Action | UI | API route | Service / lib |
|--------|-----|-----------|----------------|
| **Create lot** | `LotForm`, `MarketplaceOverview`, `LotList` | `POST /api/lots` | `lib/lots/service` → `createLot` |
| **Update lot** | `LotForm`, `LotList`, `LotDetail` | `PUT /api/lots/[id]` | `lib/lots/service` → `updateLot` |
| **Delete lot** | `LotDetail`, `LotList` | `DELETE /api/lots/[id]` | `lib/lots/service` → `deleteLot` |
| **List lots** | `LotList`, `MarketplaceOverview`, `DashboardHome` | `GET /api/lots` | `lib/lots/service` → `listLots`, `getUserLots` |
| **Get lot** | `LotDetail` (via parent fetch) | `GET /api/lots/[id]` | `lib/lots/service` → `getLotById` |
| **External lots** | Producer app | `GET /api/lots/external` | `lib/lots/service` → `listLots`, `getUserLots` |
| **Create bid** | Producer app | `POST /api/bids` | `Bid` model; `resolveMongoUserId` |
| **List bids** | `BidList`, `MarketplaceOverview`, `DashboardHome` | `GET /api/bids` | — |
| **Accept / reject bid** | `BidCard`, `BidList` | `PUT /api/bids/[id]` | `lib/contracts/service` → `createContractFromBid`; `lib/webhooks/bid-webhook` |
| **Counter-offer** | `BidCard`, `BidList` | `PUT /api/bids/[id]` | `Bid` model; `lib/webhooks/bid-webhook` → `notifyCounterOffer` |
| **Accept counter** | Producer app | `POST /api/bids/[id]/accept-counter` | `lib/contracts/service` → `createContractFromCounterOffer` |
| **List contracts** | `ContractList`, `MarketplaceOverview`, `DashboardHome` | `GET /api/contracts` | `lib/contracts/service` → `getUserContracts` |
| **Get contract** | — | `GET /api/contracts/[id]` | `lib/contracts/service` → `getContractById` |
| **Update contract status** | `ContractCard`, `ContractList` | `PUT /api/contracts/[id]` | `lib/contracts/service` → `updateContractStatus` |
| **External contract** | Producer app | `GET /api/contracts/external/[id]` | `lib/contracts/service` → `getContractById` |

---

## 1. High-Level Workflows

### 1.1 Lot posting (create / update / delete / publish)

```
User opens Lot form (create or edit)
    → LotForm collects data, submits POST /api/lots or PUT /api/lots/[id]
    → API auth + org resolution (resolveUserOrgId)
    → lib/lots/service: createLot | updateLot | deleteLot
    → Lot saved (or deleted) in MongoDB
    → Lot webhooks sent (created | updated | deleted | published)
    → UI: onSuccess(savedLot) → optional “Lot visible to producers” banner when status=published
```

**Lot status lifecycle:** `draft` → `published` | `reserved` (on bid accept) | `sold` (on contract) | `cancelled`.

### 1.2 Bidding (create bid, accept, reject, counter-offer, accept counter)

```
Producer/Buyer submits bid
    → POST /api/bids (body: lotId, bidderId, volume, pricing, …)
    → Bid created, status=pending
    → Producer stores bid._id, links to ProducerBid

Lot owner responds:
    → Accept: PUT /api/bids/[id] { status: 'accepted' }
        → Lot → reserved, Contract created from bid, notifyBidAccepted
    → Reject: PUT /api/bids/[id] { status: 'rejected' }
        → notifyBidRejected
    → Counter: PUT /api/bids/[id] { counterOffer: { price, volume, message } }
        → Bid.counterOffer set, notifyCounterOffer

Producer accepts counter-offer:
    → POST /api/bids/[id]/accept-counter
        → createContractFromCounterOffer(bidId)
        → Lot → sold, Bid → accepted, notifyBidAccepted
```

### 1.3 Contract (create from bid, create from counter-offer, list, get, update status)

```
Contract creation:
    (A) Bid accepted → PUT /api/bids/[id] { status: 'accepted' }
        → createContractFromBid(userId, bidId) in lib/contracts/service
    (B) Counter-offer accepted → POST /api/bids/[id]/accept-counter
        → createContractFromCounterOffer(bidId)

In both cases:
    → Contract created (contractNumber auto: CNT-YYYY-XXXX)
    → Lot status → sold
    → Bid status → accepted (B only; A already set)
    → Webhook notifyBidAccepted (includes contract)

Contract list/detail/status:
    → GET /api/contracts (user’s org), GET /api/contracts/[id]
    → PUT /api/contracts/[id] { status, signedBy } for status updates
```

---

## 2. Workflow → File Mapping (By Action)

### 2.1 Lot — Create

| Layer | File | What it does |
|-------|------|----------------|
| **UI** | `components/marketplace/LotForm.tsx` | Form state, validation, `handleSubmit` → `POST /api/lots` or `PUT /api/lots/[id]`, `onSuccess(data.lot)` |
| **UI** | `components/marketplace/MarketplaceOverview.tsx` | “Post New Tender” opens LotForm; `handleLotCreateSuccess` checks `savedLot?.status === 'published'` → shows “Lot visible to producers” banner |
| **UI** | `components/marketplace/LotList.tsx` | “Post New Lot” opens LotForm; `handleFormClose` refetches lots |
| **API** | `app/api/lots/route.ts` | `POST`: auth, `createLot(userId, body)`, returns `{ lot }` |
| **API** | `app/api/lots/[id]/route.ts` | `PUT`: auth, `updateLot(id, userId, body)`, returns `{ lot }` |
| **Service** | `lib/lots/service.ts` | `createLot(userId, lotData)`: resolve org + Mongo user, create Lot, set `publishedAt` if published, `notifyLotCreated` |
| **Service** | `lib/certificates/service.ts` | `resolveUserOrgId(clerkUserId)` used by lot service |
| **Service** | `lib/user-resolver.ts` | `resolveMongoUserId(clerkUserId)` for `postedBy` |
| **Webhook** | `lib/webhooks/lot-webhook.ts` | `notifyLotCreated` → `lot.created`; `notifyLotUpdated` also sends `lot.published` when status→published |
| **Model** | `models/Lot.ts` | Schema, `pricePerUnit`/price pre-save hook, status enum |

### 2.2 Lot — Update

| Layer | File | What it does |
|-------|------|----------------|
| **UI** | `components/marketplace/LotForm.tsx` | Same as create; when `lot` prop provided, `PUT /api/lots/[id]` |
| **UI** | `components/marketplace/LotList.tsx` | `handleEdit(lot)` → open LotForm with `editingLot` |
| **UI** | `components/marketplace/LotDetail.tsx` | “Edit” → `onEdit(lot)` → parent opens LotForm |
| **API** | `app/api/lots/[id]/route.ts` | `PUT` → `updateLot(params.id, userId, body)` |
| **Service** | `lib/lots/service.ts` | `updateLot(lotId, userId, updates)`: ownership check, assign updates, set `publishedAt` when →published, `notifyLotUpdated` |
| **Webhook** | `lib/webhooks/lot-webhook.ts` | `notifyLotUpdated`; also `notifyLotCreated('lot.published', …)` when status becomes published |

### 2.3 Lot — Delete

| Layer | File | What it does |
|-------|------|----------------|
| **UI** | `components/marketplace/LotDetail.tsx` | “Delete” → confirm → `onDelete(lot._id)`, `onClose()` |
| **UI** | `components/marketplace/LotList.tsx` | `handleDelete(lotId)` → `DELETE /api/lots/[id]`, remove from local state, close detail |
| **API** | `app/api/lots/[id]/route.ts` | `DELETE` → `deleteLot(params.id, userId)` |
| **Service** | `lib/lots/service.ts` | `deleteLot(lotId, userId)`: ownership check, store copy for webhook, `Lot.findByIdAndDelete`, `notifyLotDeleted` |
| **Webhook** | `lib/webhooks/lot-webhook.ts` | `notifyLotDeleted` → `lot.deleted` |

### 2.4 Lot — List / Get

| Layer | File | What it does |
|-------|------|----------------|
| **UI** | `components/marketplace/LotList.tsx` | `fetchLots` → `GET /api/lots?mine=true&includeDrafts=true` or public list with search/type filters |
| **UI** | `components/marketplace/MarketplaceOverview.tsx` | `fetchAllData` → `GET /api/lots?mine=true&includeDrafts=true` for “My Listings” |
| **UI** | `components/dashboard/DashboardHome.tsx` | `GET /api/lots?mine=true` for dashboard summary |
| **UI** | `components/marketplace/LotCard.tsx` | Displays single lot; click → `LotDetail` (when used from LotList) |
| **UI** | `components/marketplace/LotDetail.tsx` | Slide-over detail view; no direct API call (receives `lot` from parent) |
| **API** | `app/api/lots/route.ts` | `GET`: if `mine=true` + auth → `getUserLots`; else `listLots(filters)` (default published) |
| **API** | `app/api/lots/[id]/route.ts` | `GET`: `getLotById`, increment views if published, return `{ lot }` |
| **API** | `app/api/lots/external/route.ts` | `GET`: API key or Clerk; `listLots` or `getUserLots` for Producer Dashboard |
| **Service** | `lib/lots/service.ts` | `listLots`, `getUserLots`, `getLotById`, `incrementLotViews` |
| **Model** | `models/Lot.ts` | Schema, indexes |

### 2.5 Bid — Create

| Layer | File | What it does |
|-------|------|----------------|
| **UI** | Producer app (external) | Submits bid to Buyer `POST /api/bids`; Buyer repo has `lib/webhooks/buyer-bid-service.ts` as example client |
| **API** | `app/api/bids/route.ts` | `POST`: parse body, validate lotId/bidderId/volume/pricing, `resolveMongoUserId(bidderId)`, check lot published, `externalBidId` dedup, `Bid.create`, return `{ bid }` |
| **Service** | `lib/user-resolver.ts` | `resolveMongoUserId` for bidder |
| **Model** | `models/Bid.ts` | Schema, `pricePerUnit`/price pre-save, `counterOffer` subdoc |
| **Middleware** | `middleware.ts` | `/api/bids(.*)` public so Producer can POST without Clerk |

### 2.6 Bid — List / Get

| Layer | File | What it does |
|-------|------|----------------|
| **UI** | `components/bids/BidList.tsx` | `fetchBids` → `GET /api/bids?lotId&status&type=sent|received`; polling every 5s |
| **UI** | `components/marketplace/MarketplaceOverview.tsx` | `GET /api/bids` or `GET /api/bids?type=sent` for “Active Negotiations” |
| **UI** | `components/dashboard/DashboardHome.tsx` | `GET /api/bids` for dashboard |
| **UI** | `components/dashboard/DashboardHeader.tsx` | `GET /api/bids?status=pending` for badge |
| **API** | `app/api/bids/route.ts` | `GET`: auth, orgId; `type=sent` → by bidderId, else by user’s lots; optional lotId/status filters; return `{ bids, count }` |

### 2.7 Bid — Accept / Reject / Counter-offer

| Layer | File | What it does |
|-------|------|----------------|
| **UI** | `components/bids/BidCard.tsx` | “Accept” / “Reject” → `onStatusUpdate(bidId, 'accepted'|'rejected')`; “Counter offer” → form → `onCounterOffer(bidId, data)` |
| **UI** | `components/bids/BidList.tsx` | `handleStatusUpdate` → `PUT /api/bids/[id]` { status }; `handleCounterOffer` → `PUT /api/bids/[id]` { counterOffer }; refresh list |
| **API** | `app/api/bids/[id]/route.ts` | `PUT`: auth, verify user owns lot. If `counterOffer` → validate, set on bid, `notifyCounterOffer`. If `status` → update bid, on accept: lot→reserved, `createContractFromBid`, `notifyBidAccepted`; on reject: `notifyBidRejected` |
| **Service** | `lib/contracts/service.ts` | `createContractFromBid(userId, bidId)` used by PUT handler |
| **Webhook** | `lib/webhooks/bid-webhook.ts` | `notifyBidAccepted`, `notifyBidRejected`, `notifyCounterOffer` |

### 2.8 Bid — Accept counter-offer (Producer)

| Layer | File | What it does |
|-------|------|----------------|
| **API** | `app/api/bids/[id]/accept-counter/route.ts` | `POST`: optional API key check, `createContractFromCounterOffer(params.id)`, then `notifyBidAccepted`, return `{ bid, contract }` |
| **Service** | `lib/contracts/service.ts` | `createContractFromCounterOffer(bidId)`: create contract from `bid.counterOffer`, lot→sold, bid→accepted |
| **Middleware** | `middleware.ts` | `/api/bids(.*)` public so Producer can call accept-counter |

### 2.9 Contract — Create (from bid or counter-offer)

| Layer | File | What it does |
|-------|------|----------------|
| **Service** | `lib/contracts/service.ts` | `createContractFromBid`: bid accepted, create Contract from bid+lot, lot→sold. `createContractFromCounterOffer`: bid has counterOffer, create from counterOffer, lot→sold, bid→accepted |
| **API** | `app/api/bids/[id]/route.ts` | On accept → `createContractFromBid` |
| **API** | `app/api/bids/[id]/accept-counter/route.ts` | `createContractFromCounterOffer` |
| **API** | `app/api/contracts/route.ts` | `POST`: auth, `createContractFromBid(userId, bidId, { title, description, terms })` — alternate entry if bid already accepted |
| **Model** | `models/Contract.ts` | Schema, pre-save `contractNumber` = `CNT-YYYY-XXXX` |

### 2.10 Contract — List / Get / Update status

| Layer | File | What it does |
|-------|------|----------------|
| **UI** | `components/contracts/ContractList.tsx` | `fetchContracts` → `GET /api/contracts?status`; `handleStatusUpdate` → `PUT /api/contracts/[id]` { status } |
| **UI** | `components/contracts/ContractCard.tsx` | Displays contract; status actions call `onStatusUpdate` |
| **UI** | `components/marketplace/MarketplaceOverview.tsx` | `GET /api/contracts` for “Recent Deals” |
| **UI** | `components/dashboard/DashboardHome.tsx` | `GET /api/contracts` for dashboard |
| **API** | `app/api/contracts/route.ts` | `GET`: auth, `getUserContracts(userId, { status })`; `POST`: create from bid (see above) |
| **API** | `app/api/contracts/[id]/route.ts` | `GET`: `getContractById`; `PUT`: `updateContractStatus(id, userId, status, { signedBy })` |
| **API** | `app/api/contracts/external/[id]/route.ts` | `GET`: API key auth, `getContractById` for Producer |
| **Service** | `lib/contracts/service.ts` | `getUserContracts`, `getContractById`, `updateContractStatus` (incl. signedAt, signedBySeller/Buyer, completedAt) |
| **Model** | `models/Contract.ts` | Schema, indexes |

### 2.11 Supporting / shared

| Concern | File | What it does |
|---------|------|----------------|
| **Org resolution** | `lib/certificates/service.ts` | `resolveUserOrgId(clerkUserId)` via Membership |
| **User resolution** | `lib/user-resolver.ts` | `resolveMongoUserId(clerkUserId)` for refs to User |
| **DB** | `lib/mongodb.ts` | Connect singleton |
| **Lot webhooks** | `lib/webhooks/lot-webhook.ts` | `sendLotWebhook`, `notifyLotCreated`, `notifyLotUpdated`, `notifyLotDeleted` |
| **Bid webhooks** | `lib/webhooks/bid-webhook.ts` | `sendBidWebhook`, `notifyBidAccepted`, `notifyBidRejected`, `notifyCounterOffer` |
| **Producer bid client** | `lib/webhooks/buyer-bid-service.ts` | Example: POST to Buyer `/api/bids` with `bidderId`, lotId, volume, pricing, etc. |
| **Route protection** | `middleware.ts` | Public: `/`, sign-in/up, webhooks, health, `/api/lots`, `/api/bids`, `/api/contracts/external`. Rest protected by Clerk. |

---

## 3. API Reference (Quick)

| Method | Route | Auth | Purpose |
|--------|--------|------|--------|
| `GET` | `/api/lots` | Optional | List lots (public published or `mine=true` own) |
| `POST` | `/api/lots` | Clerk | Create lot |
| `GET` | `/api/lots/[id]` | — | Get lot, increment views if published |
| `PUT` | `/api/lots/[id]` | Clerk | Update lot (owner) |
| `DELETE` | `/api/lots/[id]` | Clerk | Delete lot (owner) |
| `GET` | `/api/lots/external` | API key / Clerk | External list (Producer) |
| `GET` | `/api/bids` | Clerk | List bids (received or sent) |
| `POST` | `/api/bids` | Public | Create bid (Producer) |
| `PUT` | `/api/bids/[id]` | Clerk | Accept / reject / withdraw or send counter-offer |
| `POST` | `/api/bids/[id]/accept-counter` | Optional API key | Producer accept counter-offer |
| `GET` | `/api/contracts` | Clerk | List contracts (user’s org) |
| `POST` | `/api/contracts` | Clerk | Create contract from accepted bid |
| `GET` | `/api/contracts/[id]` | Clerk | Get contract |
| `PUT` | `/api/contracts/[id]` | Clerk | Update contract status |
| `GET` | `/api/contracts/external/[id]` | API key | Get contract (Producer) |

---

## 4. Data Model Summary

### Lot (`models/Lot.ts`)

- **Ids:** `orgId`, `postedBy` (User).
- **Core:** `title`, `description`, `type` (spot|forward|contract), `status` (draft|published|reserved|sold|cancelled), `volume`, `pricing`, `delivery`, `compliance`, `tags`, `airlineName`, `publishedAt`, `expiresAt`, `views`, `inquiries`.
- **Hooks:** `pricePerUnit` / `price` computed on save.

### Bid (`models/Bid.ts`)

- **Refs:** `lotId`, `bidderId` (User).
- **Core:** `volume`, `pricing`, `status` (pending|accepted|rejected|withdrawn|expired), `message`, `deliveryDate`, `deliveryLocation`, `source`, `externalBidId`, `counterOffer` (price, volume, message).
- **Hooks:** `pricePerUnit` / `price` computed on save.

### Contract (`models/Contract.ts`)

- **Refs:** `lotId`, `bidId`, `sellerOrgId`, `buyerOrgId`, `signedBySeller`, `signedByBuyer`.
- **Core:** `contractNumber`, `title`, `description`, `volume`, `pricing`, `delivery`, `compliance`, `status` (draft|pending_signature|signed|active|completed|cancelled), `terms`, `attachments`, `signedAt`, `completedAt`.
- **Hooks:** `contractNumber` = `CNT-YYYY-XXXX` if not set.

---

## 5. UI Entry Points

| User action | Component | Tab / page |
|-------------|-----------|------------|
| Post new lot | `LotForm` | Marketplace (airline) “Post New Tender”; LotList “Post New Lot”; My Lots |
| Edit lot | `LotForm` | LotList edit; LotDetail “Edit” |
| Delete lot | `LotDetail` “Delete” → `LotList.handleDelete` | LotList detail slide-over |
| View my lots | `LotList`, `LotCard`, `LotDetail` | Marketplace, My Lots |
| View marketplace overview | `MarketplaceOverview` | Dashboard → Marketplace (airline) |
| View bids | `BidList`, `BidCard` | Dashboard → Bids; Marketplace overview |
| Accept / reject / counter bid | `BidCard` | Bids tab |
| View contracts | `ContractList`, `ContractCard` | Dashboard → Contracts; Marketplace overview |
| Update contract status | `ContractCard` → `ContractList.handleStatusUpdate` | Contracts tab |

---

## 6. Dashboard structure

- **`app/dashboard/page.tsx`:** Tab routing; `orgType` from `/api/organization/profile`.
- **Tabs:** `home` (DashboardHome), `marketplace` (MarketplaceOverview for airline, else LotList), `producers` (ProducerList), `my-lots` (LotList), `organization` (OrganizationMembers), `bids` (BidList), `contracts` (ContractList).

---

## 7. External / integration & cross-portal connections

### 7.1 Quick summary

- **Producer → Buyer (API):** Fetch lots (`GET /api/lots/external`), submit bid (`POST /api/bids`), accept counter (`POST /api/bids/[id]/accept-counter`), fetch contract (`GET /api/contracts/external/[id]`).
- **Buyer → Producer (webhooks):** Lot events → `PRODUCER_DASHBOARD_WEBHOOK_URL`; bid events → `PRODUCER_DASHBOARD_BID_WEBHOOK_URL`.
- **Shared:** Same MongoDB (optional), shared Clerk instance. See [BUYER_PRODUCER_WORKFLOW_INTEGRATION_SPEC](./BUYER_PRODUCER_WORKFLOW_INTEGRATION_SPEC.md) for full integration details.

### 7.2 How the Buyer portal connects to the Producer portal

**Infrastructure:** Same MongoDB (optional), shared Clerk. “Different clusters” = different app deployments; both can use the same DB and Clerk app.

```
                    ┌─────────────────────┐
                    │   Buyer Portal      │
                    │   (this repo)       │
                    └──────────┬──────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
         ▼                     ▼                     ▼
   [Webhooks out]        [API in]              [Shared]
   Lots, Bids       Lots external, Bids,     MongoDB,
   → Producer       Accept-counter,          Clerk
                    Contracts external
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Producer Portal    │
                    │  (separate repo)    │
                    └─────────────────────┘
```

#### A. Buyer → Producer (webhooks)

The **Buyer** app sends HTTP `POST` requests to **Producer** endpoints when lots or bids change. Producer implements these routes and verifies the shared secret.

| What | Buyer side (this repo) | Producer side |
|------|------------------------|---------------|
| **Lot events** | `lib/webhooks/lot-webhook.ts`: `notifyLotCreated`, `notifyLotUpdated`, `notifyLotDeleted`. `lot.published` sent when status → published. | `POST /api/webhooks/lots`. Verify `Authorization: Bearer <PRODUCER_DASHBOARD_WEBHOOK_SECRET>`. Upsert/delete RFQ or “marketplace lot” using `lot._id`. |
| **Config** | `PRODUCER_DASHBOARD_WEBHOOK_URL` (e.g. `https://<producer>/api/webhooks/lots`), `PRODUCER_DASHBOARD_WEBHOOK_SECRET`. | `BUYER_WEBHOOK_SECRET` = same value as `PRODUCER_DASHBOARD_WEBHOOK_SECRET`. |
| **Bid events** | `lib/webhooks/bid-webhook.ts`: `notifyBidAccepted`, `notifyBidRejected`, `notifyCounterOffer`. Called from `app/api/bids/[id]/route.ts` (accept/reject/counter) and `app/api/bids/[id]/accept-counter/route.ts` (accept counter). | `POST /api/webhooks/bids`. Verify Bearer secret. On `bid.accepted`: mark ProducerBid won, store contract ref. On `bid.rejected`: mark lost. On `bid.counter_offer`: show UI; on accept, call Buyer accept-counter API. |
| **Config** | `PRODUCER_DASHBOARD_BID_WEBHOOK_URL` or `PRODUCER_DASHBOARD_URL` + `/api/webhooks/bids`; same secret. | Same `BUYER_WEBHOOK_SECRET`. |

**Relevant Buyer files:**

- **`lib/webhooks/lot-webhook.ts`** — Builds `LotWebhookPayload`, sends to `PRODUCER_DASHBOARD_WEBHOOK_URL` and optional CIST URL. Used by `lib/lots/service.ts` (create/update/delete).
- **`lib/webhooks/bid-webhook.ts`** — Builds bid payloads, sends to `PRODUCER_DASHBOARD_BID_WEBHOOK_URL` (or derived from `PRODUCER_DASHBOARD_URL`). Used by `app/api/bids/[id]/route.ts` and `accept-counter/route.ts`.

#### B. Producer → Buyer (API calls)

The **Producer** app calls **Buyer** HTTP APIs to read lots, submit bids, accept counter-offers, and fetch contracts. Buyer exposes these routes; some are public or API-key protected for Producer.

| What | Buyer side (this repo) | Producer side |
|------|------------------------|---------------|
| **Fetch lots** | `GET /api/lots/external` — `app/api/lots/external/route.ts`. Uses `listLots` / `getUserLots`. Auth: API key (`X-API-Key` / `Authorization: Bearer`) or Clerk. Query: `?status=published`, etc. | Call `BUYER_DASHBOARD_URL/api/lots/external?status=published`. Use lots for “marketplace” / RFQ list. Optionally sync via webhooks. |
| **Submit bid** | `POST /api/bids` — `app/api/bids/route.ts`. Public (middleware). Needs `lotId`, `bidderId` (Clerk `userId`), `volume`, `pricing`. Uses `resolveMongoUserId`, creates `Bid`. | Create ProducerBid; `POST` to `BUYER_DASHBOARD_URL/api/bids` with `bidderId` = current user’s Clerk `userId`, `lotId`, `volume`, `pricing`, `externalBidId` = ProducerBid `_id`. Store returned `bid._id`. |
| **Accept counter** | `POST /api/bids/[id]/accept-counter` — `app/api/bids/[id]/accept-counter/route.ts`. Optional API key. Calls `createContractFromCounterOffer`, then `notifyBidAccepted`. | On “Accept” counter-offer, `POST` to `BUYER_DASHBOARD_URL/api/bids/<bidId>/accept-counter`. Use API key if Buyer enforces it. |
| **Fetch contract** | `GET /api/contracts/external/[id]` — `app/api/contracts/external/[id]/route.ts`. API key auth. Uses `getContractById`. | After `bid.accepted` webhook, fetch `BUYER_DASHBOARD_URL/api/contracts/external/<contractId>` to show contract. Or use same DB / webhook payload. |

**Relevant Buyer files:**

- **`app/api/lots/external/route.ts`** — External lots API.
- **`app/api/bids/route.ts`** — Bid creation (Producer posts here).
- **`app/api/bids/[id]/accept-counter/route.ts`** — Accept counter-offer.
- **`app/api/contracts/external/[id]/route.ts`** — External contract fetch.
- **`middleware.ts`** — `/api/lots`, `/api/bids`, `/api/contracts/external` public so Producer can call without Clerk redirect.

**Producer reference client:** `lib/webhooks/buyer-bid-service.ts` — Example for posting to `POST /api/bids`. Producer must send `bidderId` (Clerk `userId`).

#### C. Shared MongoDB and Clerk

- **MongoDB:** Same logical DB (e.g. same `MONGODB_URI`). Buyer stores Lots, Bids, Contracts. Producer can use same collections (e.g. read `contracts`) or keep RFQ/ProducerBid and sync via webhooks + API.
- **Clerk:** Same `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`. Producer users log in with shared Clerk; `bidderId` in `POST /api/bids` is always a Clerk `userId`.

#### D. Connection summary table

| Connection | Direction | Buyer (this repo) | Producer |
|------------|-----------|-------------------|----------|
| Lot created/updated/deleted/published | Buyer → Producer | `lib/webhooks/lot-webhook.ts`; `lib/lots/service.ts` | `POST /api/webhooks/lots` |
| Bid accepted/rejected/counter-offer | Buyer → Producer | `lib/webhooks/bid-webhook.ts`; `app/api/bids/[id]/route.ts`, `accept-counter/route.ts` | `POST /api/webhooks/bids` |
| Fetch lots | Producer → Buyer | `app/api/lots/external/route.ts` | `GET /api/lots/external` |
| Submit bid | Producer → Buyer | `app/api/bids/route.ts` | `POST /api/bids` |
| Accept counter-offer | Producer → Buyer | `app/api/bids/[id]/accept-counter/route.ts` | `POST /api/bids/[id]/accept-counter` |
| Fetch contract | Producer → Buyer | `app/api/contracts/external/[id]/route.ts` | `GET /api/contracts/external/[id]` |

---

## 8. Notes

### 8.1 Airport lots

- **`app/api/airports/lots/route.ts`:** `GET` aggregates **published** lots by `delivery.deliveryLocation` (matched to airport codes). Returns airport metadata + lot stats (count, volume, price min/max/avg, standards). Used for map/airport-centric views.

### 8.2 Contract access

- `GET /api/contracts` returns only contracts for the user’s org (via `getUserContracts`).
- `GET /api/contracts/[id]` returns any contract by ID; it does **not** check org membership. Callers typically use links from the contract list. Consider adding an org check if you need stricter access control.

### 8.3 Webhook order

- Lot create/update: `notifyLotCreated` / `notifyLotUpdated` run **after** the lot is persisted. `lot.published` is sent when status changes to published (inside `notifyLotUpdated`).
- Bid accept: Lot → reserved, then `createContractFromBid`, then `notifyBidAccepted`. Contract create updates lot → sold.

---

*Use this doc to trace any lot, bid, or contract action from UI → API → service → model → webhooks.*
