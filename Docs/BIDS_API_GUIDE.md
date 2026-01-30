# Bids API Guide

This guide explains how to send bids to the Marketplace from your external system running on port 3004.

## Overview

The Marketplace accepts bids on published lots via the `/api/bids` endpoint. Bids can be sent from any external system and will appear in the "Bids Received" tab for lot owners.

## API Endpoint

**POST** `http://localhost:3004/api/bids`

### Request Headers

```json
{
  "Content-Type": "application/json"
}
```

### Request Body

```json
{
  "lotId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "bidderId": "bidder_123",
  "bidderName": "ABC Airlines",
  "bidderEmail": "contact@abcairlines.com",
  "volume": {
    "amount": 50000,
    "unit": "gallons"
  },
  "pricing": {
    "price": 250000,
    "currency": "USD",
    "pricePerUnit": 5.0,
    "paymentTerms": "Net 30"
  },
  "message": "We are interested in purchasing this lot. Please contact us for further details.",
  "deliveryDate": "2025-03-15T00:00:00.000Z",
  "deliveryLocation": "JFK Airport, New York",
  "externalBidId": "ext_bid_456",
  "expiresAt": "2025-02-15T00:00:00.000Z"
}
```

### Required Fields

- `lotId` - The ID of the lot you're bidding on
- `bidderId` - Unique identifier for the bidder
- `volume` - Object with `amount` (number) and `unit` (string: 'gallons', 'liters', 'metric-tons')
- `pricing` - Object with:
  - `price` - Total bid price (number)
  - `currency` - Currency code (string: 'USD', 'EUR', 'GBP')
  - `pricePerUnit` (optional) - Price per unit (will be calculated if not provided)
  - `paymentTerms` (optional) - Payment terms description

### Optional Fields

- `bidderName` - Name of the bidding organization
- `bidderEmail` - Contact email
- `message` - Message from bidder
- `deliveryDate` - Proposed delivery date (ISO string)
- `deliveryLocation` - Delivery location
- `externalBidId` - External bid ID (prevents duplicates)
- `expiresAt` - Bid expiration date (ISO string)

## Example: Sending a Bid

### Using fetch (JavaScript/TypeScript)

```typescript
async function submitBid(lotId: string) {
  const bidData = {
    lotId: lotId,
    bidderId: 'bidder_123',
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
    externalBidId: `bid_${Date.now()}`, // Unique ID
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
    console.log('Bid submitted successfully:', result.bid)
    return result.bid
  } catch (error) {
    console.error('Error submitting bid:', error)
    throw error
  }
}
```

### Using curl

```bash
curl -X POST http://localhost:3004/api/bids \
  -H "Content-Type: application/json" \
  -d '{
    "lotId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "bidderId": "bidder_123",
    "bidderName": "ABC Airlines",
    "bidderEmail": "contact@abcairlines.com",
    "volume": {
      "amount": 50000,
      "unit": "gallons"
    },
    "pricing": {
      "price": 250000,
      "currency": "USD",
      "pricePerUnit": 5.0,
      "paymentTerms": "Net 30"
    },
    "message": "We are interested in purchasing this lot.",
    "deliveryDate": "2025-03-15T00:00:00.000Z",
    "deliveryLocation": "JFK Airport, New York"
  }'
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
    "bidderId": "bidder_123",
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
    "source": "port-3004",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

### Error Responses

#### 400 Bad Request - Missing Fields
```json
{
  "error": "Missing required fields: lotId, bidderId, volume, pricing"
}
```

#### 404 Not Found - Lot Doesn't Exist
```json
{
  "error": "Lot not found"
}
```

#### 400 Bad Request - Lot Not Published
```json
{
  "error": "Lot is not available for bidding"
}
```

#### 409 Conflict - Duplicate Bid
```json
{
  "error": "Bid already exists",
  "bid": { ... }
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

## Bid Statuses

- `pending` - Bid is waiting for response
- `accepted` - Bid was accepted by lot owner
- `rejected` - Bid was rejected by lot owner
- `withdrawn` - Bid was withdrawn by bidder
- `expired` - Bid expired

## Notes

1. **Lot Status**: Only lots with status `published` can receive bids
2. **Duplicate Prevention**: Use `externalBidId` to prevent duplicate bids
3. **Price Calculation**: If `pricePerUnit` is provided, total `price` will be calculated. Otherwise, `pricePerUnit` will be calculated from total `price`
4. **Volume Units**: Must match lot's volume unit or be compatible
5. **No Authentication Required**: The POST endpoint is public for external systems

## Testing

Test the endpoint:

```bash
# 1. Get a lot ID first
curl http://localhost:3004/api/lots?status=published

# 2. Submit a bid using the lot ID
curl -X POST http://localhost:3004/api/bids \
  -H "Content-Type: application/json" \
  -d '{
    "lotId": "YOUR_LOT_ID_HERE",
    "bidderId": "test_bidder_1",
    "bidderName": "Test Airlines",
    "volume": { "amount": 10000, "unit": "gallons" },
    "pricing": { "price": 50000, "currency": "USD", "pricePerUnit": 5.0 }
  }'
```

## Viewing Bids

Bids will appear in the Marketplace dashboard under the "Bids Received" tab. Lot owners can:
- View all bids on their lots
- Filter by status (pending, accepted, rejected)
- Accept or reject bids
- See bidder contact information



