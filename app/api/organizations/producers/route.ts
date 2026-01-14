import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Organization from '@/models/Organization'

export const dynamic = 'force-dynamic'

// GET /api/organizations/producers - Get all producer organizations
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')

    const query: any = {
      type: 'producer',
      onboardingStatus: 'completed',
    }

    // Add search filter if provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { organizationType: { $regex: search, $options: 'i' } },
        { 'legalEntity.legalName': { $regex: search, $options: 'i' } },
      ]
    }

    const producers = await Organization.find(query)
      .select('name organizationType companyEmail teamSize userName branding volumeRange createdAt')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ producers, count: producers.length })
  } catch (error: any) {
    console.error('Error fetching producers:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch producers' }, { status: 500 })
  }
}




