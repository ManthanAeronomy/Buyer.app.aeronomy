import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Bid from '@/models/Bid'
import Lot from '@/models/Lot'
import { resolveUserOrgId } from '@/lib/certificates/service'
import { notifyBidAccepted, notifyBidRejected, notifyCounterOffer } from '@/lib/webhooks/bid-webhook'

export const dynamic = 'force-dynamic'

// PUT /api/bids/[id] - Update bid status (accept/reject/withdrawn) or send counter-offer
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const orgId = await resolveUserOrgId(userId)

    if (!orgId) {
      return NextResponse.json({ error: 'No organization membership found' }, { status: 400 })
    }

    const bid = await Bid.findById(params.id).populate('lotId')
    if (!bid) {
      return NextResponse.json({ error: 'Bid not found' }, { status: 404 })
    }

    const lot = bid.lotId as any
    if (lot.orgId.toString() !== orgId) {
      return NextResponse.json({ error: 'Unauthorized: You can only respond to bids on your own lots' }, { status: 403 })
    }

    const body = await request.json()
    const { status, counterOffer } = body

    // Counter-offer: seller proposes new price/volume to producer
    if (counterOffer && typeof counterOffer === 'object') {
      const { price, volume, message } = counterOffer
      const amount = volume?.amount ?? volume
      const unit = volume?.unit ?? (bid as any).volume?.unit ?? 'gallons'
      if (typeof price !== 'number' || price < 0 || typeof amount !== 'number' || amount <= 0) {
        return NextResponse.json(
          { error: 'Counter-offer must include price and volume.amount (or volume) as positive numbers' },
          { status: 400 }
        )
      }
      if ((bid as any).status !== 'pending') {
        return NextResponse.json({ error: 'Only pending bids can receive a counter-offer' }, { status: 400 })
      }
      ;(bid as any).counterOffer = { price, volume: { amount, unit }, message: message || undefined }
      await bid.save()
      await notifyCounterOffer(bid, { price, volume: amount, message }, lot)
      const updated = await Bid.findById(bid._id).populate('lotId', 'title volume pricing status').lean()
      return NextResponse.json({ bid: updated, counterOfferSent: true })
    }

    if (!status || !['accepted', 'rejected', 'withdrawn'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Must be: accepted, rejected, or withdrawn' }, { status: 400 })
    }

    ;(bid as any).status = status
    ;(bid as any).respondedAt = new Date()
    await bid.save()

    let contract: unknown = null

    if (status === 'accepted') {
      await Lot.findByIdAndUpdate(lot._id, { status: 'reserved' })
      try {
        const { createContractFromBid } = await import('@/lib/contracts/service')
        contract = await createContractFromBid(userId, bid._id.toString())
      } catch (contractError: any) {
        console.error('Failed to create contract from bid:', contractError.message)
      }
      await notifyBidAccepted(bid, lot, contract)
    } else if (status === 'rejected') {
      await notifyBidRejected(bid, lot)
    }

    const updatedBid = await Bid.findById(bid._id)
      .populate('lotId', 'title volume pricing status')
      .lean()

    return NextResponse.json({ bid: updatedBid, contract })
  } catch (error: any) {
    console.error('Error updating bid:', error)
    return NextResponse.json({ error: error.message || 'Failed to update bid' }, { status: 500 })
  }
}

