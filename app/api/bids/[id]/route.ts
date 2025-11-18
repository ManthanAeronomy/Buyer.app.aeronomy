import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Bid from '@/models/Bid'
import Lot from '@/models/Lot'
import { resolveUserOrgId } from '@/lib/certificates/service'

export const dynamic = 'force-dynamic'

// PUT /api/bids/[id] - Update bid status (accept/reject)
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

    // Verify user owns the lot
    const lot = bid.lotId as any
    if (lot.orgId.toString() !== orgId) {
      return NextResponse.json({ error: 'Unauthorized: You can only respond to bids on your own lots' }, { status: 403 })
    }

    const body = await request.json()
    const { status } = body

    if (!status || !['accepted', 'rejected', 'withdrawn'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Must be: accepted, rejected, or withdrawn' }, { status: 400 })
    }

    // Update bid status
    bid.status = status as any
    bid.respondedAt = new Date()
    await bid.save()

    // If accepted, update lot status to reserved and create contract
    if (status === 'accepted') {
      await Lot.findByIdAndUpdate(lot._id, { status: 'reserved' })
      
      // Automatically create a contract from the accepted bid
      try {
        const { createContractFromBid } = await import('@/lib/contracts/service')
        await createContractFromBid(userId, bid._id.toString())
      } catch (contractError: any) {
        // Log error but don't fail the bid acceptance
        console.error('Failed to create contract from bid:', contractError.message)
      }
    }

    const updatedBid = await Bid.findById(bid._id)
      .populate('lotId', 'title volume pricing status')
      .lean()

    return NextResponse.json({ bid: updatedBid })
  } catch (error: any) {
    console.error('Error updating bid:', error)
    return NextResponse.json({ error: error.message || 'Failed to update bid' }, { status: 500 })
  }
}

