# Producer Dashboard Integration Guide

## Buyer Dashboard API Reference (Port 3004)

### 1. Fetch All Published Lots

```bash
GET http://localhost:3004/api/lots/external?status=published
# Optional: X-API-Key header for authentication
```

**Response:**
```json
{
  "lots": [
    {
      "_id": "...",
      "title": "SAF Lot Title",
      "volume": { "amount": 100000, "unit": "gallons" },
      "pricing": { "price": 500000, "currency": "USD", "pricePerUnit": 5.00 },
      "delivery": { "deliveryDate": "2026-03-01", "deliveryLocation": "JFK" },
      "status": "published"
    }
  ],
  "count": 10
}
```

### 2. Fetch Single Lot
```bash
GET http://localhost:3004/api/lots/{lotId}
```

### 3. Submit Bid to Buyer

```bash
POST http://localhost:3004/api/bids
Content-Type: application/json

{
  "lotId": "buyer_lot_mongo_id",
  "bidderId": "producer_user_id",
  "bidderName": "Producer Company Name",
  "bidderEmail": "contact@producer.com",
  "volume": {
    "amount": 50000,
    "unit": "gallons"
  },
  "pricing": {
    "price": 250000,
    "currency": "USD",
    "pricePerUnit": 5.00
  },
  "message": "We can deliver by March 2026",
  "deliveryDate": "2026-03-01T00:00:00.000Z",
  "deliveryLocation": "JFK Airport",
  "externalBidId": "producer-bid-unique-123"
}
```

---

## Producer Webhook Endpoints to Implement

### 1. Lot Webhook Receiver
**Path:** `POST /api/webhooks/lots`

Receives events: `lot.created`, `lot.updated`, `lot.published`, `lot.deleted`

```typescript
// app/api/webhooks/lots/route.ts
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.BUYER_WEBHOOK_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { event, lot, organization } = await request.json()
  
  switch (event) {
    case 'lot.created':
    case 'lot.updated':
    case 'lot.published':
      // Upsert lot in your database
      break
    case 'lot.deleted':
      // Delete lot from your database
      break
  }
  
  return NextResponse.json({ success: true })
}
```

### 2. Bid Status Webhook Receiver
**Path:** `POST /api/webhooks/bids`

Receives events: `bid.accepted`, `bid.rejected`, `bid.counter_offer`

```typescript
// app/api/webhooks/bids/route.ts
export async function POST(request: NextRequest) {
  const { event, bid, lot, contract } = await request.json()
  
  switch (event) {
    case 'bid.accepted':
      // Update bid status in your DB
      // Create contract record if provided
      break
    case 'bid.rejected':
      // Update bid status to rejected
      break
    case 'bid.counter_offer':
      // Handle counter offer logic
      break
  }
  
  return NextResponse.json({ success: true })
}
```

---

## Environment Variables (Producer Side)

```env
# Connection to Buyer Dashboard
BUYER_DASHBOARD_URL=http://localhost:3004
BUYER_API_KEY=dev-api-key-123
BUYER_WEBHOOK_SECRET=dev-webhook-secret-456

# Production
# BUYER_DASHBOARD_URL=https://app.aeronomy.co
```
