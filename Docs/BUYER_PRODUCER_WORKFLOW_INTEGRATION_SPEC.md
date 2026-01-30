# Buyer–Producer Workflow Integration Spec

**Status:** Implementation guide  
**Last updated:** January 26, 2026  
**Context:** Same MongoDB database (different clusters), shared Clerk instance.

This spec defines how the **Buyer Portal** (16 Jan Buyer) and **Producer Portal** (Producer.app.aeronomy) integrate to support the end-to-end workflow: Buyer posts lots → Producer views & bids → Buyer accepts → Contract shared → (optional) counter-bids.

---

## 1. Workflow Summary

| Step | Actor | Action | System |
|------|--------|--------|--------|
| 1 | Buyer | Posts tender/lot | Buyer portal |
| 2 | Buyer | Sees “Lot visible to producers” | Buyer portal |
| 3 | Producer | Views posted lots (requirements, details) | Producer portal |
| 4 | Producer | Submits bid on lot | Producer → Buyer API |
| 5 | Buyer | Sees bid in “Bids received” | Buyer portal |
| 6 | Buyer | Accepts bid | Buyer portal |
| 7 | — | Contract created | Buyer (Contract model) |
| 8 | Producer | Receives bid accepted + contract | Webhook + optional API/DB |
| 9 | Both | View & manage contract | Both portals |
| 10 | (Optional) | Buyer sends counter-offer → Producer accepts | TBD |

---

## 2. Infrastructure Assumptions

- **MongoDB:** Same logical database. “Different clusters” = different app deployments (e.g. Buyer vs Producer ECS/k8s), both connecting to the same MongoDB (e.g. same Atlas cluster or same `MONGODB_URI`).
- **Clerk:** Shared Clerk instance. Both apps use the same `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`. Users and orgs are shared.

**Implications:**

- Producer users exist in Clerk; when they bid, use their **Clerk `userId`** as `bidderId` in Buyer’s API.
- Buyer’s `resolveMongoUserId(bidderId)` will resolve Clerk → MongoDB User (create if missing via Clerk API). Same User collection if same DB.
- If same DB: Producer can read Buyer’s `lots`, `bids`, `contracts` collections if desired. Alternatively, Producer keeps own collections (e.g. RFQ, ProducerBid) and syncs via webhooks + API only.

---

## 3. Data Model Mapping

### 3.1 Lot (Buyer) ↔ RFQ / Marketplace Lots (Producer)

**Producer codebase (from Producer analysis):** RFQ model, `/api/marketplace/lots`, `/api/webhooks/lots`. Use `GET /api/marketplace/lots` or Buyer `GET /api/lots/external` to feed “opportunities” / marketplace UI.

| Buyer | Producer | Notes |
|-------|----------|--------|
| **Lot** | **RFQ** or “marketplace lot” | Same concept: buyer’s tender. |
| `Lot._id` | `RFQ.externalId` / `rfqId` | Store Buyer lot `_id` when syncing. |
| `Lot.title`, `description`, `volume`, `pricing`, `delivery`, `compliance`, `status` | Map into RFQ or equivalent fields | Use full lot payload from webhook or `GET /api/lots/external`. |
| `status: 'published'` | Visible to producers | Only published lots are biddable. |

**Options for Producer:**

- **A) Webhook sync:** On `lot.created` / `lot.updated` / `lot.published`, create/update **RFQ** (or “marketplace lot”) in Producer DB. Use `lot._id` as `externalId` / `sourceLotId`.
- **B) API fetch only:** Don’t store lots. Producer always calls `GET /api/lots/external?status=published` (and filters) and displays results. Simpler but no offline/cache.
- **C) Hybrid:** Fetch on first load, then rely on webhooks to update local RFQ/store.

### 3.2 Bid (Buyer) ↔ ProducerBid (Producer)

**Producer codebase:** ProducerBid model, `/api/producer-bids`, `/api/webhooks/bids`. When submitting to Buyer, use the **Clerk `userId`** of the logged-in Producer user as `bidderId`. The Buyer repo’s `lib/webhooks/buyer-bid-service.ts` is an example client that posts to `POST /api/bids`; it currently omits `bidderId` — Producer’s implementation **must** include it.

| Buyer | Producer | Notes |
|-------|----------|--------|
| **Bid** | **ProducerBid** | Producer’s response to a lot/RFQ. |
| `Bid._id` | `ProducerBid.externalBidId` or `buyerBidId` | Store Buyer bid `_id` when Producer submits. |
| `ProducerBid._id` | `Bid.externalBidId` | Send when posting to Buyer to avoid duplicates. |
| `Bid.bidderId` | Clerk `userId` of Producer user | **Required** by Buyer. Same Clerk user. |
| `Bid.lotId` | `ProducerBid.rfqId` / `lotId` | Buyer lot `_id`. |
| `Bid.volume`, `pricing`, `message`, `deliveryDate`, `deliveryLocation` | Same on ProducerBid | Map 1:1 when submitting. |

**Flow:**

1. Producer creates **ProducerBid** (draft/submitted) in Producer DB.
2. Producer calls Buyer `POST /api/bids` with:
   - `lotId` = Buyer lot `_id`
   - `bidderId` = current user’s Clerk `userId`
   - `volume`, `pricing`, `message`, `deliveryDate`, `deliveryLocation`
   - `externalBidId` = `ProducerBid._id` (or another unique id).
3. Buyer creates **Bid**, returns `{ bid }` with `bid._id`.
4. Producer stores `bid._id` as `ProducerBid.buyerBidId` / `externalBidId` for future correlation.

### 3.3 Contract (Buyer) ↔ Contract (Producer)

**Producer codebase:** Contract model, `/api/contracts`. Producer can persist contracts from `bid.accepted` webhook or read from shared DB.

| Buyer | Producer | Notes |
|-------|----------|--------|
| **Contract** | **Contract** or equivalent | Same deal, possibly same collection if same DB. |
| `Contract._id`, `contractNumber`, `status`, `volume`, `pricing`, `delivery`, etc. | Store or reference | From `bid.accepted` webhook payload or DB read. |
| `buyerOrgId` | Producer org | Optional in Buyer; often `buyerName` / `buyerEmail` only. |
| `sellerOrgId` | Buyer org (lot owner) | Lot owner = seller. |

**Ways to “share” contract with Producer:**

- **Same DB:** Producer reads Buyer’s `contracts` collection (e.g. by `bidId` or `contractNumber`). Optionally replicate into Producer’s own Contract model.
- **Webhook:** `bid.accepted` already includes `contract: { _id, contractNumber, status }`. Can extend payload with full contract if needed.
- **API:** Buyer exposes `GET /api/contracts/[id]` for external callers (API key or Clerk). Producer fetches after `bid.accepted`.

---

## 4. API Contracts (Buyer → Producer)

### 4.1 Producer fetches lots (Buyer API)

**Endpoint:** `GET /api/lots/external`

- **Auth:** API key (`X-API-Key` or `Authorization: Bearer <PRODUCER_DASHBOARD_API_KEY>`) or Clerk session.
- **Query:** `?status=published` (required if no `orgId`), plus optional `type`, `minPrice`, `maxPrice`, `standards`, `search`.
- **Response:** `{ lots, count }`. Each lot includes `_id`, `orgId`, `title`, `description`, `type`, `status`, `volume`, `pricing`, `delivery`, `compliance`, `tags`, `airlineName`, `publishedAt`, etc.

Producer uses this to list “marketplace lots” or to back a “Discover opportunities” / RFQ list.

### 4.2 Producer submits bid (Buyer API)

**Endpoint:** `POST /api/bids`

- **Auth:** Public (no auth). Middleware allows `POST /api/bids` for external producers.
- **Headers:** `Content-Type: application/json`. Optional: `Authorization: Bearer <API_KEY>` if Buyer adds API-key check later.
- **Body (required):**
  - `lotId` (string): Buyer lot `_id`.
  - `bidderId` (string): **Clerk `userId`** of the Producer user placing the bid (shared Clerk).
  - `volume`: `{ amount: number, unit: string }`.
  - `pricing`: `{ price: number, currency: string }` and/or `pricePerUnit`.
- **Body (optional):** `bidderName`, `bidderEmail`, `message`, `deliveryDate`, `deliveryLocation`, `externalBidId`, `expiresAt`.

**Response:** `201 { bid }` with created Bid (including `_id`). Producer must store `bid._id` and link to `ProducerBid`.

**Important:** Buyer’s `POST /api/bids` uses `resolveMongoUserId(bidderId)`. `bidderId` **must** be a valid Clerk `userId`. Producer always sends the logged-in user’s Clerk `userId`.

### 4.3 Producer fetches contract (Buyer API) — optional

If Producer does **not** use same DB:

- **Endpoint:** `GET /api/contracts/[id]` (or e.g. `GET /api/contracts/external/[id]`).
- **Auth:** API key or Clerk. Buyer must implement this if contract sharing is via API rather than DB/webhook.

Currently Buyer may not expose this for external callers. Either add it or rely on webhook + same DB.

---

## 5. Webhooks (Buyer → Producer)

### 5.1 Lot webhooks

**Producer endpoint:** `POST /api/webhooks/lots`  
**Buyer config:** `PRODUCER_DASHBOARD_WEBHOOK_URL` = Producer base + `/api/webhooks/lots`, `PRODUCER_DASHBOARD_WEBHOOK_SECRET` for `Authorization: Bearer <secret>`.

**Events:** `lot.created` | `lot.updated` | `lot.deleted` | `lot.published`

**Payload:** See `LotWebhookPayload` in Buyer’s `lib/webhooks/lot-webhook.ts` (e.g. `event`, `timestamp`, `lot`, `organization`).

**Producer responsibilities:**

1. Verify `Authorization: Bearer <PRODUCER_DASHBOARD_WEBHOOK_SECRET>` (use same value as Buyer’s `PRODUCER_DASHBOARD_WEBHOOK_SECRET`).
2. On `lot.created` / `lot.updated` / `lot.published`: upsert RFQ or “marketplace lot” using `lot._id` and payload.
3. On `lot.deleted`: remove or mark inactive.

### 5.2 Bid status webhooks

**Producer endpoint:** `POST /api/webhooks/bids`  
**Buyer config:** `PRODUCER_DASHBOARD_BID_WEBHOOK_URL` or `PRODUCER_DASHBOARD_URL` + `/api/webhooks/bids`, same `PRODUCER_DASHBOARD_WEBHOOK_SECRET`.

**Events:** `bid.accepted` | `bid.rejected` | `bid.counter_offer`

**Payload:** `event`, `timestamp`, `bid`, `lot`, `contract` (for `bid.accepted`), `counterOffer` (for `bid.counter_offer`).

**Producer responsibilities:**

1. Verify Bearer token same as Buyer’s webhook secret.
2. **`bid.accepted`:** Update ProducerBid to “won”, store or reference Contract (from payload or DB). Show “Contract” in Producer UI.
3. **`bid.rejected`:** Update ProducerBid to “lost”.
4. **`bid.counter_offer`:** Show counter-offer UI; when Producer accepts, call Buyer counter-accept API (see below).

---

## 6. Producer-Side Implementation Checklist

Use this to implement or verify Producer behavior.

### 6.1 Lot visibility (workflow steps 1–3)

- [ ] **Webhook:** `POST /api/webhooks/lots` implemented. Verify Bearer secret.
- [ ] **Persistence:** On `lot.created` / `lot.updated` / `lot.published`, create/update RFQ or marketplace lot; store `lot._id`.
- [ ] **Listing:** Producer UI lists lots from synced RFQs **or** from `GET /api/lots/external?status=published`. Filters (type, price, standards, search) as needed.
- [ ] **Detail view:** Full lot details (requirements, volume, pricing, delivery, compliance, etc.) available when Producer opens a lot.

### 6.2 Bidding (workflow steps 4–5)

- [ ] **Bid form:** Producer can submit volume, pricing, message, delivery date/location for a chosen lot.
- [ ] **Identity:** Use **Clerk `userId`** of current user as `bidderId` when calling Buyer `POST /api/bids`.
- [ ] **ProducerBid:** Create ProducerBid locally; set `externalBidId` = `ProducerBid._id` (or unique id) when posting to Buyer.
- [ ] **API call:** `POST` to `BUYER_DASHBOARD_URL/api/bids` with `lotId`, `bidderId`, `volume`, `pricing`, and optional fields. Handle 4xx/5xx.
- [ ] **Link back:** Store returned `bid._id` on ProducerBid (`buyerBidId` / `externalBidId`) for webhook correlation.
- [ ] **UI:** “Bid submitted” feedback; list “My bids” with status.

### 6.3 Bid status & contract (workflow steps 6–9)

- [ ] **Webhook:** `POST /api/webhooks/bids` implemented. Verify Bearer secret.
- [ ] **`bid.accepted`:** Update ProducerBid to won; persist Contract (from webhook or same DB). Show contract in Producer UI.
- [ ] **`bid.rejected`:** Update ProducerBid to lost; optional in-app/email notification.
- [ ] **Contract view:** Producer can open contract (draft/final), see contract number, parties, volume, pricing, delivery. If same DB, read from Buyer’s `contracts` collection or from synced copy.

### 6.4 Counter-offers (workflow step 10, optional)

- [ ] **`bid.counter_offer`:** Handle in `/api/webhooks/bids`. Show counter-offer (price, volume, message) in Producer UI.
- [ ] **Accept counter:** When Producer accepts, call Buyer “accept counter” API (see Buyer gaps below). Then treat like bid accepted (contract created/updated, etc.).

### 6.5 Configuration

- [ ] **Env:**  
  `BUYER_DASHBOARD_URL`, `BUYER_API_KEY` (or equivalent for lots external + bids),  
  `BUYER_WEBHOOK_SECRET` = same as Buyer’s `PRODUCER_DASHBOARD_WEBHOOK_SECRET`.
- [ ] **Clerk:** Same Clerk keys as Buyer. Producer users log in with shared Clerk.

---

## 7. Buyer-Side Gaps and Required Changes

### 7.1 Already in place

- Lot webhooks to Producer (`lot.created` / `lot.updated` / `lot.published` / `lot.deleted`).
- Bid status webhooks (`bid.accepted` / `bid.rejected`); `bid.counter_offer` exists in `bid-webhook` but is not used yet.
- `GET /api/lots/external?status=published` for Producer to fetch lots.
- `POST /api/bids` accepts `bidderId` (Clerk), `lotId`, `volume`, `pricing`, and optional fields; `externalBidId` supported.
- `PUT /api/bids/[id]` accept/reject; on accept, Contract created and `notifyBidAccepted` sent.
- Middleware keeps `POST /api/bids` public for external submissions.

### 7.2 “Lot visible to producers” (step 2)

- **Gap:** Explicit on-screen confirmation that the lot is visible to producers.
- **Change:** After creating/publishing a lot and successfully sending `lot.created` / `lot.published` webhook, show a clear success message, e.g. “Your lot is now visible to producers on the platform.”

### 7.3 Counter-offer flow (step 10)

- **Gap:** No counter-offer lifecycle: Buyer cannot send counter-offer; Producer cannot accept it.
- **Changes:**
  1. **Buyer:** Add counter-offer action, e.g. `PUT /api/bids/[id]` with `{ status: 'counter_offer', counterOffer: { price, volume, message } }`. Update Bid (e.g. status or metadata), then `notifyCounterOffer(...)` to Producer.
  2. **Producer:** On `bid.counter_offer` webhook, show counter-offer; on “Accept,” call new Buyer endpoint.
  3. **Buyer:** Add e.g. `POST /api/bids/[id]/accept-counter` (or similar). Producer calls it when accepting. Buyer creates/updates Contract from counter-offer and notifies Producer (e.g. extend `bid.accepted` or a new event).

### 7.4 Contract sharing with Producer

- **Same DB:** No extra Buyer change. Producer reads `contracts` collection.
- **Different DB / API-based:** Implement `GET /api/contracts/[id]` (or `/api/contracts/external/[id]`) with API-key or Clerk auth, and document it for Producer. Alternatively, extend `bid.accepted` webhook to include full contract payload so Producer doesn’t need to fetch.

### 7.5 API key for POST /api/bids (optional)

- **Current:** No auth for `POST /api/bids`.
- **Optional:** Validate `X-API-Key` or `Authorization: Bearer` against `PRODUCER_DASHBOARD_API_KEY` (or similar) for stricter access. Keep `bidderId` as Clerk `userId`.

---

## 8. Environment Variables

### Buyer (.env)

```env
# Producer integration
PRODUCER_DASHBOARD_WEBHOOK_URL=https://<producer-host>/api/webhooks/lots
PRODUCER_DASHBOARD_WEBHOOK_SECRET=<shared-secret>
PRODUCER_DASHBOARD_BID_WEBHOOK_URL=https://<producer-host>/api/webhooks/bids
# OR
PRODUCER_DASHBOARD_URL=https://<producer-host>

PRODUCER_DASHBOARD_API_KEY=<optional-for-lots-external>
```

### Producer (.env)

```env
# Buyer integration
BUYER_DASHBOARD_URL=https://<buyer-host>
BUYER_API_KEY=<optional-for-lots-external-and-bids>
BUYER_WEBHOOK_SECRET=<same-as-PRODUCER_DASHBOARD_WEBHOOK_SECRET>

# Clerk (shared with Buyer)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
```

---

## 9. Summary

- **Same MongoDB:** Producer can read Buyer’s lots, bids, contracts if desired; otherwise sync via webhooks + API.
- **Shared Clerk:** Producer always sends `bidderId` = Clerk `userId` when submitting bids.
- **Producer:** Implement `/api/webhooks/lots`, `/api/webhooks/bids`; optionally sync RFQ/ProducerBid/Contract; call `GET /api/lots/external` and `POST /api/bids`; handle `bid.accepted` / `bid.rejected` / `bid.counter_offer`.
- **Buyer:** Add “Lot visible to producers” feedback; implement counter-offer flow and, if needed, external contract fetch or richer webhook payload.

This should be enough to implement the full workflow in both portals and to extend it later (e.g. counter-bids, contract signing).
