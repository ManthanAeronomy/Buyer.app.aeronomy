import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Bid from '@/models/Bid'
import { createContractFromCounterOffer } from '@/lib/contracts/service'
import { notifyBidAccepted } from '@/lib/webhooks/bid-webhook'

export const dynamic = 'force-dynamic'

/**
 * POST /api/bids/[id]/accept-counter
 * Producer accepts the buyer's counter-offer. Creates contract from counter-offer terms.
 * Auth: optional API key (X-API-Key or Authorization Bearer) via PRODUCER_DASHBOARD_API_KEY.
 * Public if no API key configured (for local dev).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
    const expectedKey = process.env.PRODUCER_DASHBOARD_API_KEY
    if (expectedKey && apiKey !== expectedKey) {
      return NextResponse.json({ error: 'Unauthorized. Provide X-API-Key or Authorization Bearer.' }, { status: 401 })
    }

    await connectDB()

    const bid = await Bid.findById(params.id).populate('lotId')
    if (!bid) {
      return NextResponse.json({ error: 'Bid not found' }, { status: 404 })
    }

    const contract = await createContractFromCounterOffer(params.id)
    const lot = bid.lotId as any
    // Bid already updated and saved by createContractFromCounterOffer
    const updatedBid = await Bid.findById(params.id).populate('lotId', 'title volume pricing status')
    await notifyBidAccepted(updatedBid, lot, contract)

    const populated = await contract.populate([
      { path: 'lotId', select: 'title volume pricing' },
      { path: 'bidId', select: 'bidderName bidderEmail' },
      { path: 'sellerOrgId', select: 'name branding' },
    ])

    return NextResponse.json({ bid: updatedBid, contract: populated }, { status: 201 })
  } catch (error: any) {
    console.error('Error accepting counter-offer:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to accept counter-offer' },
      { status: 500 }
    )
  }
}
