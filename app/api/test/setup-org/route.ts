import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Organization from '@/models/Organization'
import Membership from '@/models/Membership'

export const dynamic = 'force-dynamic'

/**
 * POST /api/test/setup-org
 * Creates a test organization and assigns the current user as admin
 * This is for testing purposes only
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // Check if user already has an organization
    const existingMembership = await Membership.findOne({ userId }).lean()
    if (existingMembership) {
      const org = await Organization.findById(existingMembership.orgId).lean()
      return NextResponse.json({
        message: 'You already have an organization',
        organization: org,
        membership: existingMembership,
      })
    }

    // Create test organization
    const org = new Organization({
      name: 'Test Airline Organization',
      billingEmail: undefined,
      plan: 'test',
      branding: {
        brandName: 'Test Airlines',
      },
    })

    await org.save()

    // Create admin membership for the user
    const membership = new Membership({
      orgId: org._id,
      userId: userId,
      role: 'admin',
    })

    await membership.save()

    return NextResponse.json({
      message: 'Test organization created successfully',
      organization: {
        _id: org._id.toString(),
        name: org.name,
        branding: org.branding,
      },
      membership: {
        _id: membership._id.toString(),
        orgId: membership.orgId.toString(),
        userId: membership.userId,
        role: membership.role,
      },
    })
  } catch (error: any) {
    console.error('Error setting up test organization:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to setup test organization' },
      { status: 500 }
    )
  }
}




