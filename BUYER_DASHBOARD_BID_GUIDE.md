# Buyer Dashboard - Bid Submission Guide

This guide explains how to submit bids from the Buyer Dashboard (port 3000) to the Marketplace (port 3004).

## Endpoint

**POST** `http://localhost:3004/api/bids`

## Request Format

```typescript
const bidData = {
  lotId: 'YOUR_LOT_ID', // Required: ID of the lot you're bidding on
  bidderId: 'buyer_123', // Required: Unique identifier for the bidder
  bidderName: 'ABC Airlines', // Optional: Name of bidding organization
  bidderEmail: 'contact@abcairlines.com', // Optional: Contact email
  volume: {
    amount: 50000, // Required: Volume amount
    unit: 'gallons' // Required: 'gallons', 'liters', or 'metric-tons'
  },
  pricing: {
    price: 250000, // Required: Total bid price
    currency: 'USD', // Required: 'USD', 'EUR', or 'GBP'
    pricePerUnit: 5.0, // Optional: Price per unit (will be calculated if not provided)
    paymentTerms: 'Net 30' // Optional: Payment terms
  },
  message: 'We are interested in purchasing this lot.', // Optional: Message
  deliveryDate: '2025-03-15T00:00:00.000Z', // Optional: Proposed delivery date
  deliveryLocation: 'JFK Airport, New York', // Optional: Delivery location
  externalBidId: `bid_${Date.now()}`, // Optional: Unique external bid ID (prevents duplicates)
  expiresAt: '2025-02-15T00:00:00.000Z' // Optional: Bid expiration date
}
```

## Example: Submit Bid from Buyer Dashboard

```typescript
async function submitBidToMarketplace(lotId: string) {
  const bidData = {
    lotId: lotId,
    bidderId: 'buyer_123',
    bidderName: 'ABC Airlines',
    bidderEmail: 'contact@abcairlines.com',
    volume: {
      amount: 50000,
      unit: 'gallons'
    },
    pricing: {
      price: 250000,
      currency: 'USD',
      pricePerUnit: 5.0,
      paymentTerms: 'Net 30'
    },
    message: 'We are interested in purchasing this lot.',
    deliveryDate: '2025-03-15T00:00:00.000Z',
    deliveryLocation: 'JFK Airport, New York',
    externalBidId: `bid_${Date.now()}`,
  }

  try {
    const response = await fetch('http://localhost:3004/api/bids', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bidData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to submit bid')
    }

    const result = await response.json()
    console.log('✅ Bid submitted successfully:', result.bid)
    return result.bid
  } catch (error) {
    console.error('❌ Error submitting bid:', error)
    throw error
  }
}
```

## Getting Lot IDs

To get available lots to bid on:

```typescript
async function getAvailableLots() {
  const response = await fetch('http://localhost:3004/api/lots?status=published')
  const data = await response.json()
  return data.lots
}
```

## Response

### Success (201 Created)

```json
{
  "bid": {
    "_id": "65b2c3d4e5f6g7h8i9j0k1l2",
    "lotId": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "title": "Premium SAF Lot - ISCC Certified",
      "volume": { "amount": 100000, "unit": "gallons" },
      "pricing": { "currency": "USD" },
      "status": "published"
    },
    "bidderId": "buyer_123",
    "bidderName": "ABC Airlines",
    "bidderEmail": "contact@abcairlines.com",
    "volume": { "amount": 50000, "unit": "gallons" },
    "pricing": {
      "price": 250000,
      "currency": "USD",
      "pricePerUnit": 5.0,
      "paymentTerms": "Net 30"
    },
    "status": "pending",
    "message": "We are interested in purchasing this lot.",
    "deliveryDate": "2025-03-15T00:00:00.000Z",
    "deliveryLocation": "JFK Airport, New York",
    "source": "buyer-dashboard-port-3000",
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

## Error Responses

- **400 Bad Request** - Missing required fields or lot not available
- **404 Not Found** - Lot doesn't exist
- **409 Conflict** - Duplicate bid (if externalBidId already exists)

## Viewing Bids

After submitting a bid from the Buyer Dashboard:

1. The bid is stored in the Marketplace database
2. It appears in the "Bids Received" tab for the lot owner
3. The lot owner can accept or reject the bid
4. When accepted, a contract is automatically created

## Testing

```bash
# Test bid submission
curl -X POST http://localhost:3004/api/bids \
  -H "Content-Type: application/json" \
  -d '{
    "lotId": "YOUR_LOT_ID",
    "bidderId": "test_buyer_1",
    "bidderName": "Test Airlines",
    "volume": { "amount": 10000, "unit": "gallons" },
    "pricing": { "price": 50000, "currency": "USD", "pricePerUnit": 5.0 }
  }'
```

## Notes

- Bids are automatically displayed in the "Bids Received" tab
- The Marketplace polls for new bids every 5 seconds
- Only published lots can receive bids
- Use `externalBidId` to prevent duplicate submissions



