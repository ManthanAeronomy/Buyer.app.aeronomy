import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Membership from '@/models/Membership'
import User from '@/models/User'
import Organization from '@/models/Organization'
import { resolveUserOrgId } from '@/lib/certificates/service'
import { upsertUser } from '@/lib/user-service'
import { resolveMongoUserId } from '@/lib/user-resolver'

export const dynamic = 'force-dynamic'

// GET /api/organizations/members - List all members of the user's organization
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const orgId = await resolveUserOrgId(userId)
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    // Get all memberships for this organization
    const memberships = await Membership.find({ orgId }).populate('userId', 'clerkId email firstName lastName username').lean()

    // Get user details for each membership
    const membersWithDetails = await Promise.all(
      memberships.map(async (membership) => {
        // Membership.userId is now a MongoDB User ObjectId reference (populated)
        const user = membership.userId as any
        
        return {
          _id: membership._id.toString(),
          userId: user?.clerkId || membership.userId.toString(), // Return Clerk ID for backward compatibility
          role: membership.role,
          email: user?.email || 'No email',
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          username: user?.username || '',
          createdAt: membership.createdAt,
        }
      })
    )

    return NextResponse.json({ members: membersWithDetails })
  } catch (error: any) {
    console.error('Error fetching members:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch members' }, { status: 500 })
  }
}

// POST /api/organizations/members - Add a new member to the organization
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const orgId = await resolveUserOrgId(userId)
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    // Resolve current user's MongoDB User ObjectId
    const currentMongoUserId = await resolveMongoUserId(userId)
    
    // Check if current user is admin
    const currentMembership = await Membership.findOne({ userId: currentMongoUserId, orgId }).lean()
    if (!currentMembership || currentMembership.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can add members' }, { status: 403 })
    }

    const body = await request.json()
    const { clerkUserId, role } = body

    if (!clerkUserId || !role) {
      return NextResponse.json({ error: 'clerkUserId and role are required' }, { status: 400 })
    }

    // Validate role
    const validRoles = ['admin', 'compliance', 'buyer', 'finance', 'viewer']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Resolve Clerk userId to MongoDB User ObjectId (creates user if doesn't exist)
    const mongoUserId = await resolveMongoUserId(clerkUserId)

    // Check if membership already exists
    const existingMembership = await Membership.findOne({ userId: mongoUserId, orgId }).lean()
    if (existingMembership) {
      return NextResponse.json({ error: 'User is already a member of this organization' }, { status: 400 })
    }

    // Get user details for response
    const user = await User.findById(mongoUserId).lean()
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create membership with MongoDB User ObjectId reference
    const membership = new Membership({
      orgId,
      userId: mongoUserId, // MongoDB User ObjectId reference
      role,
    })

    await membership.save()

    return NextResponse.json({
      message: 'Member added successfully',
      membership: {
        _id: membership._id.toString(),
        userId: membership.userId,
        role: membership.role,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    })
  } catch (error: any) {
    console.error('Error adding member:', error)
    return NextResponse.json({ error: error.message || 'Failed to add member' }, { status: 500 })
  }
}














