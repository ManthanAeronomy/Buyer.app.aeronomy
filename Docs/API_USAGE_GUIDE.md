# API Usage Guide for External Projects

This guide shows how to fetch lots from the Marketplace API from your Producer Dashboard or other external projects.

## Available Endpoints

### 1. Public Lots Endpoint (No Auth Required)

**GET** `http://localhost:3004/api/lots`

Fetch all published lots without authentication.

**Example:**
```typescript
const response = await fetch('http://localhost:3004/api/lots')
const data = await response.json()
console.log(data.lots) // Array of lots
console.log(data.count) // Total count
```

**Query Parameters:**
- `status` - Filter by status (`published`, `draft`, `sold`, etc.)
- `type` - Filter by type (`spot`, `forward`, `contract`)
- `orgId` - Filter by organization ID
- `search` - Search in title, description, airline name
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `standards` - Comma-separated compliance standards (e.g., `ISCC,RSB`)
- `mine=true` - Get user's own lots (requires Clerk auth)

**Example with filters:**
```typescript
const params = new URLSearchParams({
  status: 'published',
  type: 'spot',
  search: 'ISCC',
  minPrice: '1000',
  maxPrice: '1000000'
})

const response = await fetch(`http://localhost:3004/api/lots?${params}`)
const data = await response.json()
```

### 2. External API Endpoint (With API Key)

**GET** `http://localhost:3004/api/lots/external`

Designed for external systems. Supports API key authentication.

**Setup:**

1. **In Marketplace `.env.local`:**
```env
PRODUCER_DASHBOARD_API_KEY=your-secret-api-key-123
```

2. **In Producer Dashboard, fetch lots:**
```typescript
const response = await fetch(
  'http://localhost:3004/api/lots/external?orgId=YOUR_ORG_ID',
  {
    headers: {
      'X-API-Key': 'your-secret-api-key-123',
      // OR
      'Authorization': 'Bearer your-secret-api-key-123',
    },
  }
)

const data = await response.json()
console.log(data.lots)
```

**Query Parameters:**
- `orgId` (required if no auth) - Organization ID to fetch lots for
- `status` - Filter by status
- `type` - Filter by type
- `includeDrafts` - Include draft lots (`true`/`false`)
- `search` - Search query
- `minPrice` / `maxPrice` - Price range
- `standards` - Compliance standards

**Note:** If `PRODUCER_DASHBOARD_API_KEY` is not set, the endpoint allows public access (for local development).

## Common Issues & Solutions

### Issue: 404 Not Found

**Cause:** The endpoint doesn't exist or middleware is blocking it.

**Solution:**
1. Make sure the Marketplace server is running on `localhost:3004`
2. Check the endpoint URL is correct: `/api/lots` or `/api/lots/external`
3. Restart the Marketplace dev server after making changes

### Issue: 401 Unauthorized

**Cause:** API key is missing or incorrect.

**Solution:**
1. Check `PRODUCER_DASHBOARD_API_KEY` in Marketplace `.env.local`
2. Verify the API key in your request headers matches
3. For local development, you can remove the API key requirement (endpoint will be public)

### Issue: CORS Error

**Cause:** Cross-origin request blocked.

**Solution:**
- If both projects are on `localhost`, CORS shouldn't be an issue
- If using different ports, you may need to add CORS headers (see below)

## Example: React Component

```typescript
'use client'

import { useEffect, useState } from 'react'

interface Lot {
  _id: string
  title: string
  status: string
  volume: { amount: number; unit: string }
  pricing: { price: number; currency: string }
}

export default function LotsList() {
  const [lots, setLots] = useState<Lot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLots() {
      try {
        const response = await fetch('http://localhost:3004/api/lots')
        const data = await response.json()
        setLots(data.lots || [])
      } catch (error) {
        console.error('Failed to fetch lots:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLots()
  }, [])

  if (loading) return <div>Loading lots...</div>

  return (
    <div>
      <h2>Available Lots ({lots.length})</h2>
      {lots.map((lot) => (
        <div key={lot._id}>
          <h3>{lot.title}</h3>
          <p>Status: {lot.status}</p>
          <p>Volume: {lot.volume.amount} {lot.volume.unit}</p>
          <p>Price: {lot.pricing.currency} {lot.pricing.price}</p>
        </div>
      ))}
    </div>
  )
}
```

## Example: With API Key

```typescript
async function fetchLotsWithApiKey(orgId: string) {
  const apiKey = process.env.NEXT_PUBLIC_MARKETPLACE_API_KEY || 'your-api-key'
  
  const response = await fetch(
    `http://localhost:3004/api/lots/external?orgId=${orgId}`,
    {
      headers: {
        'X-API-Key': apiKey,
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch lots: ${response.statusText}`)
  }

  const data = await response.json()
  return data.lots
}
```

## Testing Endpoints

### Test Public Endpoint

```bash
# Get all published lots
curl http://localhost:3004/api/lots

# Get lots with filters
curl "http://localhost:3004/api/lots?status=published&type=spot&search=ISCC"
```

### Test External Endpoint

```bash
# Without API key (if not configured)
curl "http://localhost:3004/api/lots/external?orgId=YOUR_ORG_ID"

# With API key
curl -H "X-API-Key: your-api-key" \
  "http://localhost:3004/api/lots/external?orgId=YOUR_ORG_ID"
```

## Response Format

Both endpoints return the same format:

```json
{
  "lots": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "title": "Premium SAF Lot - ISCC Certified",
      "description": "...",
      "type": "spot",
      "status": "published",
      "volume": {
        "amount": 100000,
        "unit": "gallons"
      },
      "pricing": {
        "price": 500000,
        "currency": "USD",
        "pricePerUnit": 5.0
      },
      "compliance": {
        "standards": ["ISCC", "CORSIA"],
        "ghgReduction": 80
      },
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z"
    }
  ],
  "count": 1
}
```

## Production Setup

For production, update the base URL:

```typescript
const MARKETPLACE_API_URL = process.env.NEXT_PUBLIC_MARKETPLACE_API_URL || 
  'https://marketplace.aeronomy.app'

const response = await fetch(`${MARKETPLACE_API_URL}/api/lots`)
```

## Security Notes

1. **Local Development:** Endpoints are public for easier testing
2. **Production:** Always use API keys for external endpoints
3. **Rate Limiting:** Consider adding rate limiting for production
4. **HTTPS:** Always use HTTPS in production



