import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Bid, { IBid } from '@/models/Bid'
import Lot from '@/models/Lot'
import { resolveUserOrgId } from '@/lib/certificates/service'
import { resolveMongoUserId } from '@/lib/user-resolver'

export const dynamic = 'force-dynamic'

// GET /api/bids - Get bids for user's lots
export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams
    const lotId = searchParams.get('lotId')
    const status = searchParams.get('status')
    const type = searchParams.get('type') // 'sent' or 'received'

    let query: any = {}

    if (type === 'sent') {
      // Find bids where the current user is the bidder (resolve Clerk userId to MongoDB User ObjectId)
      const mongoUserId = await resolveMongoUserId(userId)
      query.bidderId = mongoUserId
    } else {
      // Default: Find bids on lots owned by user's organization (Received)
      const userLots = await Lot.find({ orgId }).select('_id').lean()
      const lotIds = userLots.map((lot) => lot._id)
      query.lotId = { $in: lotIds }
    }

    if (lotId) {
      query.lotId = lotId
    }

    if (status) {
      query.status = status
    }

    const bids = await Bid.find(query)
      .populate('lotId', 'title volume pricing status')
      .populate('bidderId', 'firstName lastName email username') // Populate MongoDB User reference
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ bids, count: bids.length })
  } catch (error: any) {
    console.error('Error fetching bids:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch bids' }, { status: 500 })
  }
}

// POST /api/bids - Create a new bid (from Buyer Dashboard on port 3000)
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    console.log('📥 Receiving bid from Buyer Dashboard (port 3000)...')
    const body = await request.json()
    console.log('📦 Bid data received:', {
      lotId: body.lotId,
      bidderId: body.bidderId,
      bidderName: body.bidderName,
      price: body.pricing?.price,
    })
    const {
      lotId,
      bidderId,
      bidderName,
      bidderEmail,
      volume,
      pricing,
      message,
      deliveryDate,
      deliveryLocation,
      externalBidId,
      expiresAt,
    } = body

    // Validate required fields
    if (!lotId || !bidderId || !volume || !pricing) {
      return NextResponse.json(
        { error: 'Missing required fields: lotId, bidderId, volume, pricing' },
        { status: 400 }
      )
    }

    // Resolve bidderId (Clerk userId) to MongoDB User ObjectId
    const mongoBidderId = await resolveMongoUserId(bidderId)

    // Verify lot exists and is published
    const lot = await Lot.findById(lotId)
    if (!lot) {
      console.error(`❌ Lot not found: ${lotId}`)
      return NextResponse.json({ error: 'Lot not found' }, { status: 404 })
    }

    if (lot.status !== 'published') {
      console.error(`❌ Lot ${lotId} is not published. Status: ${lot.status}`)
      return NextResponse.json({ 
        error: `Lot is not available for bidding. Current status: ${lot.status}` 
      }, { status: 400 })
    }

    console.log(`✅ Lot found: ${lot.title} (Status: ${lot.status})`)

    // Check if bid already exists (by externalBidId if provided)
    if (externalBidId) {
      const existingBid = await Bid.findOne({ externalBidId, lotId })
      if (existingBid) {
        return NextResponse.json(
          { error: 'Bid already exists', bid: existingBid },
          { status: 409 }
        )
      }
    }

    // Create bid with MongoDB User ObjectId reference
    const bid = await Bid.create({
      lotId,
      bidderId: mongoBidderId, // MongoDB User ObjectId reference
      bidderName, // Keep for display/backward compatibility
      bidderEmail, // Keep for display/backward compatibility
      volume,
      pricing,
      status: 'pending',
      message,
      deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
      deliveryLocation,
      source: 'buyer-dashboard-port-3000', // Updated to reflect bids coming from Buyer Dashboard
      externalBidId,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    })

    console.log(`✅ Bid received from Buyer Dashboard (port 3000):`, {
      bidId: bid._id,
      lotId: lot.title,
      bidderName: bid.bidderName || bid.bidderId,
      price: bid.pricing.price,
      currency: bid.pricing.currency,
    })

    const populatedBid = await Bid.findById(bid._id)
      .populate('lotId', 'title volume pricing status')
      .populate('bidderId', 'firstName lastName email username') // Populate MongoDB User reference
      .lean()

    return NextResponse.json({ bid: populatedBid }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating bid:', error)
    return NextResponse.json({ error: error.message || 'Failed to create bid' }, { status: 500 })
  }
}

