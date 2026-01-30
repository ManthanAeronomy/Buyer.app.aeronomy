import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Bid, { IBid } from '@/models/Bid'
import Lot from '@/models/Lot'
import { resolveUserOrgId } from '@/lib/certificates/service'
import { resolveMongoUserId } from '@/lib/user-resolver'

export const dynamic = 'force-dynamic'

// CORS headers for cross-origin requests from Producer Dashboard
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // In production, set to specific origin like 'http://localhost:3000'
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
}

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders })
}

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

// POST /api/bids - Create a new bid (from Producer Dashboard or internal)
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    // Check if this is an external bid (from Producer Dashboard)
    const apiKey = request.headers.get('X-API-Key')
    const isExternalBid = !!apiKey // If API key is present, it's from Producer Dashboard

    console.log(`📥 Receiving bid${isExternalBid ? ' from Producer Dashboard (external)' : ' (internal)'}...`)
    const body = await request.json()
    console.log('📦 Bid data received:', {
      lotId: body.lotId,
      bidderId: body.bidderId,
      bidderName: body.bidderName,
      price: body.pricing?.price,
      isExternal: isExternalBid,
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
    if (!lotId || !volume || !pricing) {
      return NextResponse.json(
        { error: 'Missing required fields: lotId, volume, pricing' },
        { status: 400, headers: corsHeaders }
      )
    }

    // For external bids, require bidderName and bidderEmail instead of bidderId resolution
    if (isExternalBid && (!bidderName || !bidderEmail)) {
      return NextResponse.json(
        { error: 'External bids require bidderName and bidderEmail' },
        { status: 400, headers: corsHeaders }
      )
    }

    // For internal bids, require bidderId
    if (!isExternalBid && !bidderId) {
      return NextResponse.json(
        { error: 'Missing required field: bidderId' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Only resolve bidderId for internal bids (same Clerk instance)
    // For external bids, we'll store null and rely on bidderName/bidderEmail
    let mongoBidderId = null
    if (!isExternalBid && bidderId) {
      try {
        mongoBidderId = await resolveMongoUserId(bidderId)
      } catch (userError: any) {
        console.error('Error resolving user:', userError.message)
        // For internal bids, this is an error. For external, we proceed without user.
      }
    }

    // Verify lot exists and is published
    const lot = await Lot.findById(lotId)
    if (!lot) {
      console.error(`❌ Lot not found: ${lotId}`)
      return NextResponse.json({ error: 'Lot not found' }, { status: 404, headers: corsHeaders })
    }

    if (lot.status !== 'published') {
      console.error(`❌ Lot ${lotId} is not published. Status: ${lot.status}`)
      return NextResponse.json({
        error: `Lot is not available for bidding. Current status: ${lot.status}`
      }, { status: 400, headers: corsHeaders })
    }

    console.log(`✅ Lot found: ${lot.title} (Status: ${lot.status})`)

    // Check if bid already exists (by externalBidId if provided)
    if (externalBidId) {
      const existingBid = await Bid.findOne({ externalBidId, lotId })
      if (existingBid) {
        return NextResponse.json(
          { error: 'Bid already exists', bid: existingBid },
          { status: 409, headers: corsHeaders }
        )
      }
    }

    // Create bid - for external bids, bidderId may be null but bidderName/Email are stored
    const bid = await Bid.create({
      lotId,
      bidderId: mongoBidderId, // null for external bids
      bidderName, // Always store for display
      bidderEmail, // Always store for contact
      externalBidderId: isExternalBid ? bidderId : undefined, // Store original Clerk ID from producer
      volume,
      pricing,
      status: 'pending',
      message,
      deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
      deliveryLocation,
      source: isExternalBid ? 'producer-dashboard' : 'internal',
      externalBidId,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    })

    console.log(`✅ Bid created${isExternalBid ? ' (external)' : ''}:`, {
      bidId: bid._id,
      lotId: lot.title,
      bidderName: bid.bidderName,
      price: bid.pricing.price,
      currency: bid.pricing.currency,
    })

    const populatedBid = await Bid.findById(bid._id)
      .populate('lotId', 'title volume pricing status')
      .populate('bidderId', 'firstName lastName email username') // Will be null for external bids
      .lean()

    return NextResponse.json({ bid: populatedBid }, { status: 201, headers: corsHeaders })
  } catch (error: any) {
    console.error('Error creating bid:', error)
    return NextResponse.json({ error: error.message || 'Failed to create bid' }, { status: 500, headers: corsHeaders })
  }
}
