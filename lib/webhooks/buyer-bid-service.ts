/**
 * Service to send bids from Producer Dashboard to Buyer Dashboard
 * 
 * This service handles sending bid/offer submissions from producers
 * to the Buyer Dashboard running on port 3000
 */

const BUYER_DASHBOARD_URL = process.env.BUYER_DASHBOARD_URL || 'http://localhost:3000'
const BUYER_DASHBOARD_API_KEY = process.env.PRODUCER_API_KEY || 'producer-api-key-456'

export interface BidSubmissionData {
  /** Buyer lot _id (required). */
  lotId: string
  /** Clerk userId of the Producer user placing the bid (required, shared Clerk). */
  bidderId: string
  producerName: string
  producerEmail: string
  volume: number
  volumeUnit?: string // 'MT', 'gal', 'liters', 'metric-tons', 'gallons'
  pricePerUnit: number
  currency?: string // 'USD', 'EUR', 'GBP'
  totalPrice?: number // Will be calculated if not provided
  notes: string
  paymentTerms?: string
  deliveryDate?: string // ISO date string
  deliveryLocation?: string
  externalBidId?: string // Unique ID to prevent duplicates (e.g. ProducerBid._id)
  status?: string // 'pending', 'accepted', 'rejected', 'withdrawn'
}

/**
 * Send a bid/offer from Producer Dashboard to Buyer Dashboard
 */
export async function sendBidToBuyerDashboard(bidData: BidSubmissionData): Promise<{ success: boolean; bid?: any; error?: string }> {
  const url = `${BUYER_DASHBOARD_URL}/api/bids`

  // Calculate total price if not provided
  const totalPrice = bidData.totalPrice || (bidData.volume * bidData.pricePerUnit)

  const payload = {
    lotId: bidData.lotId,
    bidderId: bidData.bidderId,
    bidderName: bidData.producerName,
    bidderEmail: bidData.producerEmail,
    volume: { amount: bidData.volume, unit: bidData.volumeUnit || 'MT' },
    pricing: {
      price: totalPrice,
      currency: bidData.currency || 'USD',
      pricePerUnit: bidData.pricePerUnit,
      paymentTerms: bidData.paymentTerms || undefined,
    },
    message: bidData.notes,
    deliveryDate: bidData.deliveryDate,
    deliveryLocation: bidData.deliveryLocation,
    externalBidId: bidData.externalBidId || `bid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  }

  try {
    console.log(`📤 Sending bid to Buyer Dashboard (${BUYER_DASHBOARD_URL})...`, {
      lotId: bidData.lotId,
      bidderId: bidData.bidderId,
      producerName: bidData.producerName,
      pricePerUnit: bidData.pricePerUnit,
    })

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BUYER_DASHBOARD_API_KEY}`,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `Buyer Dashboard returned ${response.status} ${response.statusText}`
      
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.error || errorMessage
      } catch {
        errorMessage = errorText || errorMessage
      }

      console.error(`❌ Failed to send bid to Buyer Dashboard:`, errorMessage)
      return { success: false, error: errorMessage }
    }

    const result = await response.json()
    console.log(`✅ Bid sent successfully to Buyer Dashboard:`, {
      bidId: result.bid?._id,
      lotId: bidData.lotId,
    })

    return { success: true, bid: result.bid }
  } catch (error: any) {
    const errorMessage = error.message || 'Failed to connect to Buyer Dashboard'
    console.error(`❌ Error sending bid to Buyer Dashboard:`, errorMessage)
    return { success: false, error: errorMessage }
  }
}

/**
 * Check if Buyer Dashboard is available
 */
export async function checkBuyerDashboardConnection(): Promise<boolean> {
  try {
    const url = `${BUYER_DASHBOARD_URL}/api/bids`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return response.ok
  } catch {
    return false
  }
}



