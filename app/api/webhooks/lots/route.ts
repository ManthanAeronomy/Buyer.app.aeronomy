/**
 * Webhook endpoint for Producer Dashboard to receive lot events
 * This endpoint can be called by the Producer Dashboard to receive real-time updates
 * 
 * Alternatively, the Producer Dashboard can poll /api/lots/external for latest lots
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret if needed
    const authHeader = request.headers.get('authorization')
    const expectedSecret = process.env.PRODUCER_DASHBOARD_WEBHOOK_SECRET

    if (expectedSecret) {
      const token = authHeader?.replace('Bearer ', '')
      if (token !== expectedSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const payload = await request.json()
    console.log('📥 Received lot webhook:', payload.event)

    // Here you could process the webhook payload
    // For now, we'll just acknowledge receipt
    // In a real scenario, you might want to:
    // - Store webhook events in a queue
    // - Update a cache
    // - Trigger other actions

    return NextResponse.json({ success: true, message: 'Webhook received' })
  } catch (error: any) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: error.message || 'Failed to process webhook' }, { status: 500 })
  }
}



