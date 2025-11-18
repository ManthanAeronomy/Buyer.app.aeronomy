import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import { getLotById, updateLot, deleteLot, incrementLotViews } from '@/lib/lots/service'

export const dynamic = 'force-dynamic'

// GET /api/lots/[id] - Get a specific lot
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const lot = await getLotById(params.id)

    if (!lot) {
      return NextResponse.json({ error: 'Lot not found' }, { status: 404 })
    }

    // Increment views for published lots
    if (lot.status === 'published') {
      await incrementLotViews(params.id)
    }

    return NextResponse.json({ lot })
  } catch (error: any) {
    console.error('Error fetching lot:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch lot' }, { status: 500 })
  }
}

// PUT /api/lots/[id] - Update a lot (authenticated, owner only)
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
    const lot = await updateLot(params.id, userId, body)

    return NextResponse.json({ lot })
  } catch (error: any) {
    console.error('Error updating lot:', error)
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: error.message || 'Failed to update lot' }, { status: 500 })
  }
}

// DELETE /api/lots/[id] - Delete a lot (authenticated, owner only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const result = await deleteLot(params.id, userId)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error deleting lot:', error)
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: error.message || 'Failed to delete lot' }, { status: 500 })
  }
}




