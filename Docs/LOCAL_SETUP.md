# Local Development Setup Guide

Quick setup guide for integrating Marketplace (localhost:3004) with Producer Dashboard (localhost:3004).

## Quick Start

### Step 1: Configure Marketplace Project

Add to `.env.local` in the **Marketplace project**:

```env
# Producer Dashboard Webhook (Local)
PRODUCER_DASHBOARD_WEBHOOK_URL=http://localhost:3004/api/webhooks/lots
PRODUCER_DASHBOARD_WEBHOOK_SECRET=dev-secret-key-123

# Optional: API Key for external endpoint
PRODUCER_DASHBOARD_API_KEY=dev-api-key-123
```

### Step 2: Create Webhook Endpoint in Producer Dashboard

Create `app/api/webhooks/lots/route.ts` in your **Producer Dashboard project**:

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Verify secret
    const authHeader = request.headers.get('authorization')
    const expectedSecret = process.env.MARKETPLACE_WEBHOOK_SECRET || 'dev-secret-key-123'
    
    if (expectedSecret) {
      const token = authHeader?.replace('Bearer ', '')
      if (token !== expectedSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const payload = await request.json()
    const { event, lot, organization } = payload

    console.log(`📥 Received ${event} for lot: ${lot.title}`)

    // TODO: Save/update lot in your database
    // Example:
    // await db.lots.upsert({
    //   where: { marketplaceLotId: lot._id },
    //   update: lot,
    //   create: { ...lot, marketplaceLotId: lot._id }
    // })

    return NextResponse.json({ success: true, event, lotId: lot._id })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

### Step 3: Add Environment Variable to Producer Dashboard

Add to `.env.local` in the **Producer Dashboard project**:

```env
MARKETPLACE_WEBHOOK_SECRET=dev-secret-key-123
MARKETPLACE_BASE_URL=http://localhost:3004
```

**Important:** The `MARKETPLACE_WEBHOOK_SECRET` must match `PRODUCER_DASHBOARD_WEBHOOK_SECRET` in the Marketplace project.

### Step 4: Start Both Projects

```bash
# Terminal 1: Marketplace
cd aeronomy-marketplace
npm run dev
# Runs on http://localhost:3004

# Terminal 2: Producer Dashboard
cd producer-dashboard
npm run dev
# Runs on http://localhost:3004 (or another port)
```

### Step 5: Test the Integration

1. **Create a lot** in the Marketplace (http://localhost:3004/dashboard)
2. **Check Producer Dashboard console** - you should see webhook logs
3. **Verify lot appears** in Producer Dashboard

## Troubleshooting

### Webhook not received?

1. **Check both projects are running:**
   ```bash
   # Marketplace should be on port 3004
   curl http://localhost:3004/api/health/mongodb
   
   # Producer Dashboard webhook endpoint
   curl http://localhost:3004/api/webhooks/lots
   ```

2. **Check environment variables match:**
   - Marketplace: `PRODUCER_DASHBOARD_WEBHOOK_SECRET`
   - Producer Dashboard: `MARKETPLACE_WEBHOOK_SECRET`
   - They must be **identical**

3. **Check Marketplace logs** for webhook errors:
   ```bash
   # Look for webhook-related logs in Marketplace console
   # Should see: "✅ Webhook sent successfully" or "❌ Failed to send webhook"
   ```

4. **Verify webhook URL is correct:**
   - Must be: `http://localhost:3004/api/webhooks/lots`
   - Check Producer Dashboard is actually running on port 3004

### Port Conflicts?

If Producer Dashboard uses a different port (e.g., 3000):

```env
# Marketplace .env.local
PRODUCER_DASHBOARD_WEBHOOK_URL=http://localhost:3000/api/webhooks/lots
```

### CORS Issues?

If you see CORS errors, make sure:
- Both projects are on `localhost` (same origin)
- Webhook endpoint accepts POST requests
- No CORS middleware blocking requests

## Testing API Endpoint (Alternative Method)

Instead of webhooks, you can poll the API:

```typescript
// In Producer Dashboard
async function fetchLots() {
  const response = await fetch(
    'http://localhost:3004/api/lots/external?orgId=YOUR_ORG_ID',
    {
      headers: {
        'Authorization': 'Bearer dev-api-key-123',
      },
    }
  )
  const data = await response.json()
  return data.lots
}
```

## Next Steps

1. **Implement database sync** in webhook handler
2. **Add error handling** and retry logic
3. **Set up monitoring** for webhook delivery
4. **Add tests** for webhook integration

For detailed documentation, see `INTEGRATION_GUIDE.md`.



