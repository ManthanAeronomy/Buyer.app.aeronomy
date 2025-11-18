import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import { getUserContracts, createContractFromBid } from '@/lib/contracts/service'

export const dynamic = 'force-dynamic'

// GET /api/contracts - Get contracts for user's organization
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') as any

    const filters = status ? { status } : undefined
    const contracts = await getUserContracts(userId, filters)

    return NextResponse.json({ contracts, count: contracts.length })
  } catch (error: any) {
    console.error('Error fetching contracts:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch contracts' }, { status: 500 })
  }
}

// POST /api/contracts - Create a contract from an accepted bid
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const body = await request.json()
    const { bidId, title, description, terms } = body

    if (!bidId) {
      return NextResponse.json({ error: 'bidId is required' }, { status: 400 })
    }

    const contract = await createContractFromBid(userId, bidId, {
      title,
      description,
      terms,
    })

    const populatedContract = await contract.populate([
      { path: 'lotId', select: 'title volume pricing' },
      { path: 'bidId', select: 'bidderName bidderEmail' },
      { path: 'sellerOrgId', select: 'name branding' },
    ])

    return NextResponse.json({ contract: populatedContract }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating contract:', error)
    return NextResponse.json({ error: error.message || 'Failed to create contract' }, { status: 500 })
  }
}



