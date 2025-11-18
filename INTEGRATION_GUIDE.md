# Producer Dashboard Integration Guide

This guide explains how to integrate the Aeronomy SAF Marketplace with your Producer Dashboard project to sync lot data in real-time.

## Overview

When a lot is created, updated, or deleted in the Marketplace, it can automatically sync to your Producer Dashboard using one of two methods:

1. **Webhooks (Real-time)** - Marketplace sends events to your dashboard
2. **API Polling** - Dashboard fetches lots from Marketplace API

## Method 1: Webhook Integration (Recommended)

### Setup in Marketplace Project

1. **Add environment variables** to `.env.local`:

```env
# Producer Dashboard Webhook Configuration (Local Development)
PRODUCER_DASHBOARD_WEBHOOK_URL=http://localhost:3004/api/webhooks/lots
PRODUCER_DASHBOARD_WEBHOOK_SECRET=your-secret-key-here

# For production, use:
# PRODUCER_DASHBOARD_WEBHOOK_URL=https://your-producer-dashboard.com/api/webhooks/lots
```

2. **Webhooks are automatically sent** when:
   - A lot is created (`lot.created`)
   - A lot is updated (`lot.updated`)
   - A lot is published (`lot.published`)
   - A lot is deleted (`lot.deleted`)

### Webhook Payload Format

```json
{
  "event": "lot.created",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "lot": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "orgId": "65a1b2c3d4e5f6g7h8i9j0k2",
    "postedBy": "user_2abc123def456",
    "title": "Premium SAF Lot - ISCC Certified",
    "description": "High-quality sustainable aviation fuel...",
    "type": "spot",
    "status": "published",
    "volume": {
      "amount": 100000,
      "unit": "gallons"
    },
    "pricing": {
      "price": 500000,
      "currency": "USD",
      "pricePerUnit": 5.0,
      "paymentTerms": "Net 30"
    },
    "delivery": {
      "deliveryDate": "2025-03-01T00:00:00.000Z",
      "deliveryLocation": "JFK Airport, New York",
      "deliveryMethod": "Pipeline",
      "incoterms": "FOB"
    },
    "compliance": {
      "standards": ["ISCC", "CORSIA"],
      "ghgReduction": 80
    },
    "tags": ["premium", "certified"],
    "airlineName": "Aeronomy Airlines",
    "publishedAt": "2025-01-15T10:30:00.000Z",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  },
  "organization": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
    "name": "Aeronomy Airlines",
    "branding": {
      "logo": "https://...",
      "brandName": "Aeronomy"
    }
  }
}
```

### Implement Webhook Handler in Producer Dashboard

Create an endpoint in your Producer Dashboard to receive webhooks:

```typescript
// Example: Next.js API Route
// app/api/webhooks/lots/route.ts

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const authHeader = request.headers.get('authorization')
    const secret = process.env.MARKETPLACE_WEBHOOK_SECRET
    
    if (secret) {
      const token = authHeader?.replace('Bearer ', '')
      if (token !== secret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const payload = await request.json()
    const { event, lot, organization } = payload

    // Handle different events
    switch (event) {
      case 'lot.created':
      case 'lot.updated':
      case 'lot.published':
        // Sync lot to your database
        await syncLotToDashboard(lot, organization)
        break
      
      case 'lot.deleted':
        // Remove lot from your database
        await deleteLotFromDashboard(lot._id)
        break
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 })
  }
}

async function syncLotToDashboard(lot: any, organization: any) {
  // Implement your logic to save/update lot in Producer Dashboard
  // Example:
  // await db.lots.upsert({
  //   where: { marketplaceLotId: lot._id },
  //   update: lot,
  //   create: { ...lot, marketplaceLotId: lot._id }
  // })
}
```

## Method 2: API Polling Integration

### Setup in Marketplace Project

1. **Add environment variable** to `.env.local`:

```env
# Producer Dashboard API Key (optional, for authentication)
PRODUCER_DASHBOARD_API_KEY=your-api-key-here
```

### Fetch Lots from Producer Dashboard

Use the external API endpoint to fetch lots:

```typescript
// Example: Fetch lots in Producer Dashboard

async function fetchLotsFromMarketplace(orgId: string) {
  const response = await fetch(
    `https://marketplace.aeronomy.app/api/lots/external?orgId=${orgId}`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.MARKETPLACE_API_KEY}`,
        // OR
        'X-API-Key': process.env.MARKETPLACE_API_KEY,
      },
    }
  )

  const data = await response.json()
  return data.lots
}
```

### API Endpoint Details

**GET** `/api/lots/external`

**Query Parameters:**
- `orgId` (required) - Organization ID to fetch lots for
- `status` (optional) - Filter by status (`draft`, `published`, `sold`, etc.)
- `type` (optional) - Filter by type (`spot`, `forward`, `contract`)
- `includeDrafts` (optional) - Include draft lots (`true`/`false`)
- `search` (optional) - Search in title, description, airline name
- `minPrice` (optional) - Minimum price filter
- `maxPrice` (optional) - Maximum price filter
- `standards` (optional) - Comma-separated compliance standards

**Authentication:**
- Option 1: `Authorization: Bearer <API_KEY>`
- Option 2: `X-API-Key: <API_KEY>`
- Option 3: Clerk authentication (if same auth system)

**Response:**
```json
{
  "lots": [
    {
      "_id": "...",
      "title": "...",
      // ... full lot object
    }
  ],
  "count": 10
}
```

## Environment Variables Summary

### Marketplace Project (.env.local)

```env
# Webhook Configuration (for Method 1)
PRODUCER_DASHBOARD_WEBHOOK_URL=https://your-producer-dashboard.com/api/webhooks/lots
PRODUCER_DASHBOARD_WEBHOOK_SECRET=your-secret-key-here

# API Key (for Method 2)
PRODUCER_DASHBOARD_API_KEY=your-api-key-here
```

### Producer Dashboard Project (.env.local)

```env
# Webhook Secret (for Method 1) - Must match Marketplace secret
MARKETPLACE_WEBHOOK_SECRET=your-secret-key-here

# API Key (for Method 2) - Must match Marketplace API key
MARKETPLACE_API_KEY=your-api-key-here

# Marketplace Base URL (Local Development)
MARKETPLACE_BASE_URL=http://localhost:3004

# For production:
# MARKETPLACE_BASE_URL=https://marketplace.aeronomy.app
```

## Testing the Integration (Local Development)

### Prerequisites

1. **Marketplace Project** running on `localhost:3004` (or your configured port)
2. **Producer Dashboard Project** running on `localhost:3004` (or another port)

### Test Webhook Locally

#### Option A: Direct Localhost (Same Machine)

If both projects run on the same machine:

1. **In Marketplace `.env.local`:**
```env
PRODUCER_DASHBOARD_WEBHOOK_URL=http://localhost:3004/api/webhooks/lots
PRODUCER_DASHBOARD_WEBHOOK_SECRET=dev-secret-key-123
```

2. **In Producer Dashboard**, create the webhook endpoint at `/api/webhooks/lots/route.ts` (see example below)

3. **Start both projects:**
```bash
# Terminal 1: Marketplace
cd aeronomy-marketplace
npm run dev

# Terminal 2: Producer Dashboard  
cd producer-dashboard
npm run dev
```

4. **Create a lot in Marketplace** and check Producer Dashboard logs/console

#### Option B: Using ngrok (Different Machines/Networks)

If Producer Dashboard is on a different machine or you need external access:

1. **Expose Producer Dashboard with ngrok:**
```bash
cd producer-dashboard
ngrok http 3004
```

2. **Copy the ngrok URL** (e.g., `https://abc123.ngrok.io`)

3. **In Marketplace `.env.local`:**
```env
PRODUCER_DASHBOARD_WEBHOOK_URL=https://abc123.ngrok.io/api/webhooks/lots
PRODUCER_DASHBOARD_WEBHOOK_SECRET=dev-secret-key-123
```

4. **Create a lot in Marketplace** and verify webhook is received

### Test API Endpoint Locally

```bash
# Fetch lots for an organization (from Marketplace running on localhost:3004)
curl -X GET \
  "http://localhost:3004/api/lots/external?orgId=YOUR_ORG_ID" \
  -H "Authorization: Bearer YOUR_API_KEY"

# Or using X-API-Key header
curl -X GET \
  "http://localhost:3004/api/lots/external?orgId=YOUR_ORG_ID" \
  -H "X-API-Key: YOUR_API_KEY"
```

## Error Handling

- Webhooks are sent asynchronously and won't block lot creation/updates
- Failed webhooks are logged but don't affect the main flow
- For production, consider implementing a retry queue for failed webhooks
- API endpoints return proper HTTP status codes and error messages

## Security Best Practices

1. **Always use HTTPS** for webhook URLs
2. **Use strong, random secrets** for webhook authentication
3. **Validate webhook signatures** in your Producer Dashboard
4. **Rate limit** API endpoints to prevent abuse
5. **Log all webhook events** for debugging and audit trails

## Troubleshooting

### Webhooks not being sent
- Check `PRODUCER_DASHBOARD_WEBHOOK_URL` is set correctly
- Verify the URL is accessible from the Marketplace server
- Check server logs for webhook errors

### API endpoint returns 401
- Verify `PRODUCER_DASHBOARD_API_KEY` matches in both projects
- Check Authorization header format

### Lots not syncing
- Verify organization IDs match between systems
- Check webhook handler is processing events correctly
- Ensure database operations in webhook handler are working

## Support

For questions or issues, contact: hello@aeronomy.app

