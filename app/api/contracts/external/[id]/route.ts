import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { getContractById } from '@/lib/contracts/service'

export const dynamic = 'force-dynamic'

/**
 * GET /api/contracts/external/[id]
 * Fetch a contract by ID for external systems (Producer Dashboard).
 * Auth: X-API-Key or Authorization Bearer (PRODUCER_DASHBOARD_API_KEY).
 * Public if no API key configured (local dev).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
    const expectedKey = process.env.PRODUCER_DASHBOARD_API_KEY
    if (expectedKey && apiKey !== expectedKey) {
      return NextResponse.json(
        { error: 'Unauthorized. Provide X-API-Key or Authorization Bearer.' },
        { status: 401 }
      )
    }

    await connectDB()
    const contract = await getContractById(params.id)
    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    return NextResponse.json({ contract })
  } catch (error: any) {
    console.error('Error fetching contract (external):', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch contract' },
      { status: 500 }
    )
  }
}
