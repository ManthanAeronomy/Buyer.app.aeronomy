import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import { getContractById, updateContractStatus } from '@/lib/contracts/service'

export const dynamic = 'force-dynamic'

// GET /api/contracts/[id] - Get contract details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const contract = await getContractById(params.id)

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    return NextResponse.json({ contract })
  } catch (error: any) {
    console.error('Error fetching contract:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch contract' }, { status: 500 })
  }
}

// PUT /api/contracts/[id] - Update contract status
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

    const body = await request.json()
    const { status, signedBy } = body

    if (!status) {
      return NextResponse.json({ error: 'status is required' }, { status: 400 })
    }

    const contract = await updateContractStatus(params.id, userId, status, { signedBy })

    const populatedContract = await contract.populate([
      { path: 'lotId', select: 'title volume pricing' },
      { path: 'bidId', select: 'bidderName bidderEmail' },
      { path: 'sellerOrgId', select: 'name branding' },
      { path: 'buyerOrgId', select: 'name branding' },
    ])

    return NextResponse.json({ contract: populatedContract })
  } catch (error: any) {
    console.error('Error updating contract:', error)
    return NextResponse.json({ error: error.message || 'Failed to update contract' }, { status: 500 })
  }
}



