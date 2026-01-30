# Producer Dashboard → Buyer Dashboard Bid Submission Guide

This guide explains how the Producer Dashboard sends bids/offers to the Buyer Dashboard.

## Overview

When a producer wants to submit a bid/offer on a buyer's lot or request, the Producer Dashboard sends the bid to the Buyer Dashboard API.

## Flow

```
Producer Dashboard (Port 3004) → Buyer Dashboard (Port 3000)
```

## Environment Variables

Add to Producer Dashboard `.env.local`:

```env
# Buyer Dashboard Configuration
BUYER_DASHBOARD_URL=http://localhost:3000
PRODUCER_API_KEY=producer-api-key-456
```

## Usage in Producer Dashboard

### Example: Send Bid from Producer Dashboard

```typescript
import { sendBidToBuyerDashboard } from '@/lib/webhooks/buyer-bid-service'

async function submitBidToBuyer(lotId: string) {
  const bidData = {
    lotId: lotId,
    producerName: 'ABC Biofuels Inc.',
    producerEmail: 'contact@abcbiofuels.com',
    volume: 5000,
    volumeUnit: 'MT',
    pricePerUnit: 2100,
    currency: 'USD',
    notes: 'HEFA-based SAF from waste cooking oil. CORSIA certified. Available for immediate delivery.',
    paymentTerms: 'Net 30',
    deliveryDate: '2025-03-15T00:00:00.000Z',
    deliveryLocation: 'JFK Airport, New York',
    externalBidId: `bid_${Date.now()}`,
    status: 'pending',
  }

  const result = await sendBidToBuyerDashboard(bidData)

  if (result.success) {
    console.log('✅ Bid submitted successfully:', result.bid)
    return result.bid
  } else {
    console.error('❌ Failed to submit bid:', result.error)
    throw new Error(result.error)
  }
}
```

## API Endpoint

**POST** `http://localhost:3000/api/bids`

## Request Format

```json
{
  "lotId": "string",
  "producerName": "string",
  "producerEmail": "string",
  "volume": 5000,
  "volumeUnit": "MT",
  "pricePerUnit": 2100,
  "currency": "USD",
  "totalPrice": 10500000,
  "notes": "string",
  "paymentTerms": "Net 30",
  "deliveryDate": "2025-03-15T00:00:00.000Z",
  "deliveryLocation": "JFK Airport",
  "externalBidId": "unique-id-123",
  "status": "pending"
}
```

## Response

### Success (201 Created)

```json
{
  "bid": {
    "_id": "507f1f77bcf86cd799439011",
    "lotId": "test123",
    "producerName": "ABC Biofuels Inc.",
    "producerEmail": "contact@abcbiofuels.com",
    "volume": 5000,
    "volumeUnit": "MT",
    "pricePerUnit": 2100,
    "currency": "USD",
    "totalPrice": 10500000,
    "notes": "HEFA-based SAF from waste cooking oil...",
    "status": "pending",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  },
  "message": "Bid received successfully"
}
```

## Error Handling

The service returns:

```typescript
{
  success: boolean
  bid?: any // Bid object if successful
  error?: string // Error message if failed
}
```

Common errors:
- **401 Unauthorized** - Invalid API key
- **400 Bad Request** - Missing required fields or validation error
- **409 Conflict** - Duplicate bid (externalBidId already exists)
- **500 Internal Server Error** - Buyer Dashboard error

## Testing

### Test Connection

```typescript
import { checkBuyerDashboardConnection } from '@/lib/webhooks/buyer-bid-service'

const isAvailable = await checkBuyerDashboardConnection()
console.log('Buyer Dashboard available:', isAvailable)
```

### Test with curl

```bash
curl -X POST http://localhost:3000/api/bids \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer producer-api-key-456" \
  -d '{
    "lotId": "test123",
    "producerName": "ABC Biofuels",
    "producerEmail": "contact@abcbiofuels.com",
    "volume": 5000,
    "volumeUnit": "MT",
    "pricePerUnit": 2100,
    "currency": "USD",
    "notes": "Test bid submission"
  }'
```

## Integration Points

You can integrate this service into:

1. **Lot Detail Page** - "Submit Bid" button
2. **Bid Management** - When producer wants to make an offer
3. **Automated Responses** - Auto-respond to buyer inquiries
4. **Counter-Offers** - Respond to buyer's bid with counter-offer

## Notes

- The Buyer Dashboard must have the `/api/bids` endpoint set up (see `BUYER_DASHBOARD_SETUP_GUIDE.md`)
- API key authentication is required
- `externalBidId` prevents duplicate submissions
- Total price is calculated automatically if not provided
- All bids are logged for debugging



