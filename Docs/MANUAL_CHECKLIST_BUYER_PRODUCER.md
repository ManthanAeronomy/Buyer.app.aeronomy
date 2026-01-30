# Manual Checklist: Buyer–Producer Integration

**Use this checklist for setup tasks that cannot be automated** (MongoDB, keys, env vars, etc.).  
**Reference:** [BUYER_PRODUCER_WORKFLOW_INTEGRATION_SPEC.md](./BUYER_PRODUCER_WORKFLOW_INTEGRATION_SPEC.md)

---

## 1. MongoDB

- [ ] **Confirm same logical database.**  
  Buyer and Producer both use the same MongoDB (e.g. same Atlas cluster or same `MONGODB_URI`).  
  “Different clusters” = different app deployments only, not different DBs.

- [ ] **Create / verify cluster** (if using MongoDB Atlas).  
  - [ ] Cluster exists and is running (free tier may pause after inactivity).  
  - [ ] Network Access: your IP(s) and/or `0.0.0.0/0` (for cloud app hosts) allowed.  
  - [ ] Database user created with read/write access to the DB.

- [ ] **Connection string.**  
  - [ ] `MONGODB_URI` set in **Buyer** `.env.local`.  
  - [ ] `MONGODB_URI` set in **Producer** `.env.local` (same value if shared DB).

---

## 2. Clerk (shared instance)

- [ ] **Same Clerk application** used for both Buyer and Producer.  
  - [ ] **Buyer** `.env.local`:  
    `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`.  
  - [ ] **Producer** `.env.local`:  
    Same `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.

- [ ] **Clerk webhooks** (optional, for user sync):  
  - [ ] Webhook endpoint configured in Clerk Dashboard (e.g. Buyer `https://<buyer-host>/api/webhooks/clerk`).  
  - [ ] `CLERK_WEBHOOK_SECRET` set in the app that receives Clerk webhooks.

---

## 3. Buyer Portal – environment variables

Add or confirm in **Buyer** `.env.local`:

```env
# MongoDB
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db>?retryWrites=true&w=majority

# Clerk (shared)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Producer integration (webhooks)
PRODUCER_DASHBOARD_WEBHOOK_URL=https://<producer-host>/api/webhooks/lots
PRODUCER_DASHBOARD_WEBHOOK_SECRET=<shared-secret>

# Bid status webhooks (accept/reject/counter)
PRODUCER_DASHBOARD_BID_WEBHOOK_URL=https://<producer-host>/api/webhooks/bids
# OR use base URL:
# PRODUCER_DASHBOARD_URL=https://<producer-host>

# Optional: API key for /api/lots/external (Producer fetch)
PRODUCER_DASHBOARD_API_KEY=<optional-api-key>
```

- [ ] `PRODUCER_DASHBOARD_WEBHOOK_URL` points to Producer’s **lot webhook** URL.  
- [ ] `PRODUCER_DASHBOARD_BID_WEBHOOK_URL` or `PRODUCER_DASHBOARD_URL` points to Producer’s **bid webhook** base.  
- [ ] `PRODUCER_DASHBOARD_WEBHOOK_SECRET` is a **shared secret** (same value used by Producer to verify incoming webhooks).  
- [ ] `PRODUCER_DASHBOARD_API_KEY` set if you want to protect `GET /api/lots/external` and/or `GET /api/contracts/external/[id]`.

---

## 4. Producer Portal – environment variables

Add or confirm in **Producer** `.env.local`:

```env
# MongoDB (same as Buyer if shared DB)
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db>?retryWrites=true&w=majority

# Clerk (shared)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Buyer integration
BUYER_DASHBOARD_URL=https://<buyer-host>
BUYER_WEBHOOK_SECRET=<same-as-PRODUCER_DASHBOARD_WEBHOOK_SECRET>
BUYER_API_KEY=<optional-same-as-PRODUCER_DASHBOARD_API_KEY>
```

- [ ] `BUYER_DASHBOARD_URL` = Buyer app base URL (e.g. `http://localhost:3004` for local dev).  
- [ ] `BUYER_WEBHOOK_SECRET` = **exactly** the same value as Buyer’s `PRODUCER_DASHBOARD_WEBHOOK_SECRET`.  
- [ ] `BUYER_API_KEY` set if Buyer uses `PRODUCER_DASHBOARD_API_KEY` for lots/contracts external APIs.

---

## 5. Webhook reachability

- [ ] **Producer lot webhook** (`POST /api/webhooks/lots`) is reachable from Buyer’s runtime (server).  
  - Local: Buyer and Producer on same machine; use `http://localhost:<producer-port>/api/webhooks/lots`.  
  - Cross-machine / cloud: use public URL or tunnel (e.g. ngrok).

- [ ] **Producer bid webhook** (`POST /api/webhooks/bids`) is reachable from Buyer’s runtime.  
  - Same base URL as above, path `/api/webhooks/bids`.

- [ ] **Local testing with ngrok (optional):**  
  - [ ] Run ngrok for Producer (e.g. `ngrok http 3000`).  
  - [ ] Set Buyer `PRODUCER_DASHBOARD_WEBHOOK_URL` / `PRODUCER_DASHBOARD_BID_WEBHOOK_URL` to ngrok URL + path.

---

## 6. API keys and secrets (summary)

| Variable | Where | Purpose |
|----------|--------|---------|
| `PRODUCER_DASHBOARD_WEBHOOK_SECRET` | Buyer | Sent as `Authorization: Bearer <secret>` when calling Producer lot/bid webhooks. |
| `BUYER_WEBHOOK_SECRET` | Producer | Must equal `PRODUCER_DASHBOARD_WEBHOOK_SECRET`; used to verify incoming webhooks from Buyer. |
| `PRODUCER_DASHBOARD_API_KEY` | Buyer | Optional; required for `GET /api/lots/external` and `GET /api/contracts/external/[id]` if enforced. |
| `BUYER_API_KEY` | Producer | Optional; same as `PRODUCER_DASHBOARD_API_KEY` when calling Buyer lots/contracts external APIs. |

- [ ] Shared webhook secret is **identical** in both apps.  
- [ ] If using API keys, they **match** between Buyer and Producer for external APIs.

---

## 7. Producer implementation (reference)

Ensure Producer has implemented (see [BUYER_PRODUCER_WORKFLOW_INTEGRATION_SPEC](./BUYER_PRODUCER_WORKFLOW_INTEGRATION_SPEC.md) §6):

- [ ] `POST /api/webhooks/lots` – verify Bearer secret; upsert/delete lots on `lot.created` / `lot.updated` / `lot.published` / `lot.deleted`.  
- [ ] `POST /api/webhooks/bids` – verify Bearer secret; handle `bid.accepted`, `bid.rejected`, `bid.counter_offer`.  
- [ ] Producer sends **`bidderId`** (Clerk `userId`) when calling Buyer `POST /api/bids`.  
- [ ] Producer calls `POST /api/bids/[id]/accept-counter` when accepting a counter-offer (with API key if configured).

---

## 8. Post-setup checks

- [ ] **Buyer:** Post a lot as **Published** → see “Your lot is now visible to producers” banner.  
- [ ] **Producer:** Fetch lots via `GET /api/lots/external?status=published` (or webhook-synced list).  
- [ ] **Producer:** Submit a bid with `bidderId` = Clerk `userId` → Buyer sees it under “Bids received”.  
- [ ] **Buyer:** Accept bid → Contract created; Producer receives `bid.accepted` webhook.  
- [ ] **Buyer:** Send counter-offer on a pending bid → Producer receives `bid.counter_offer` webhook.  
- [ ] **Producer:** Accept counter-offer via `POST /api/bids/[id]/accept-counter` → Contract created; Producer receives `bid.accepted`.

---

**When all items are done,** the Buyer–Producer workflow (lots → bids → accept/counter → contracts) should work end-to-end across both portals.
