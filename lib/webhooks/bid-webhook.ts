/**
 * Webhook service for sending bid status updates to Producer Dashboard
 * 
 * When a bid is accepted/rejected on the Buyer Dashboard, notify the Producer
 */

export type BidWebhookEvent = 'bid.accepted' | 'bid.rejected' | 'bid.counter_offer'

export interface BidWebhookPayload {
  event: BidWebhookEvent
  timestamp: string
  bid: {
    _id: string
    lotId: string
    bidderId: string
    bidderName?: string
    bidderEmail?: string
    volume: {
      amount: number
      unit: string
    }
    pricing: {
      price: number
      currency: string
      pricePerUnit?: number
    }
    status: string
    message?: string
    externalBidId?: string
    respondedAt?: string
  }
  lot?: {
    _id: string
    title: string
    status: string
  }
  contract?: {
    _id: string
    contractNumber: string
    status: string
  }
  counterOffer?: {
    price: number
    volume: number
    message?: string
  }
}

/**
 * Send bid status webhook to Producer Dashboard
 */
export async function sendBidWebhook(
  event: BidWebhookEvent,
  bid: any,
  lot?: any,
  contract?: any,
  counterOffer?: any
): Promise<void> {
  const webhookUrl = process.env.PRODUCER_DASHBOARD_BID_WEBHOOK_URL || 
                     `${process.env.PRODUCER_DASHBOARD_URL || 'http://localhost:3000'}/api/webhooks/bids`
  const webhookSecret = process.env.PRODUCER_DASHBOARD_WEBHOOK_SECRET

  // Prepare payload
  const payload: BidWebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    bid: {
      _id: bid._id?.toString() || bid._id,
      lotId: bid.lotId?.toString() || bid.lotId,
      bidderId: bid.bidderId?.toString() || bid.bidderId,
      bidderName: bid.bidderName,
      bidderEmail: bid.bidderEmail,
      volume: bid.volume,
      pricing: bid.pricing,
      status: bid.status,
      message: bid.message,
      externalBidId: bid.externalBidId,
      respondedAt: bid.respondedAt ? new Date(bid.respondedAt).toISOString() : undefined,
    },
    lot: lot ? {
      _id: lot._id?.toString() || lot._id,
      title: lot.title,
      status: lot.status,
    } : undefined,
    contract: contract ? {
      _id: contract._id?.toString() || contract._id,
      contractNumber: contract.contractNumber,
      status: contract.status,
    } : undefined,
    counterOffer: counterOffer,
  }

  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'User-Agent': 'Aeronomy-Buyer-Dashboard/1.0',
      'X-Source': 'buyer-dashboard',
    }

    if (webhookSecret) {
      headers['Authorization'] = `Bearer ${webhookSecret}`
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `Producer Dashboard bid webhook failed with status ${response.status}: ${errorText || response.statusText}`
      )
    }

    console.log(`✅ Bid webhook sent to Producer Dashboard: ${event} for bid ${bid._id}`)
  } catch (error: any) {
    // Log error but don't throw - webhook failures shouldn't break the main flow
    console.error(`❌ Failed to send bid webhook for ${event}:`, error.message)
  }
}

/**
 * Notify Producer Dashboard when bid is accepted
 */
export async function notifyBidAccepted(bid: any, lot?: any, contract?: any): Promise<void> {
  await sendBidWebhook('bid.accepted', bid, lot, contract)
}

/**
 * Notify Producer Dashboard when bid is rejected
 */
export async function notifyBidRejected(bid: any, lot?: any): Promise<void> {
  await sendBidWebhook('bid.rejected', bid, lot)
}

/**
 * Notify Producer Dashboard of counter offer
 */
export async function notifyCounterOffer(
  bid: any, 
  counterOffer: { price: number; volume: number; message?: string },
  lot?: any
): Promise<void> {
  await sendBidWebhook('bid.counter_offer', bid, lot, undefined, counterOffer)
}
