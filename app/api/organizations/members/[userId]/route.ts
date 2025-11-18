import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Membership from '@/models/Membership'
import { resolveUserOrgId } from '@/lib/certificates/service'

export const dynamic = 'force-dynamic'

// PUT /api/organizations/members/[userId] - Update a member's role
export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: currentUserId } = await auth()

    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const orgId = await resolveUserOrgId(currentUserId)
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    // Check if current user is admin
    const currentMembership = await Membership.findOne({ userId: currentUserId, orgId }).lean()
    if (!currentMembership || currentMembership.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can update member roles' }, { status: 403 })
    }

    const body = await request.json()
    const { role } = body

    if (!role) {
      return NextResponse.json({ error: 'Role is required' }, { status: 400 })
    }

    // Validate role
    const validRoles = ['admin', 'compliance', 'buyer', 'finance', 'viewer']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Prevent removing the last admin
    if (role !== 'admin' && params.userId === currentUserId) {
      const adminCount = await Membership.countDocuments({ orgId, role: 'admin' })
      if (adminCount <= 1) {
        return NextResponse.json({ error: 'Cannot remove the last admin' }, { status: 400 })
      }
    }

    // Update membership
    const membership = await Membership.findOneAndUpdate(
      { userId: params.userId, orgId },
      { role },
      { new: true }
    ).lean()

    if (!membership) {
      return NextResponse.json({ error: 'Membership not found' }, { status: 404 })
    }

    return NextResponse.json({
      message: 'Member role updated successfully',
      membership: {
        _id: membership._id.toString(),
        userId: membership.userId,
        role: membership.role,
      },
    })
  } catch (error: any) {
    console.error('Error updating member:', error)
    return NextResponse.json({ error: error.message || 'Failed to update member' }, { status: 500 })
  }
}

// DELETE /api/organizations/members/[userId] - Remove a member from the organization
export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: currentUserId } = await auth()

    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const orgId = await resolveUserOrgId(currentUserId)
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    // Check if current user is admin
    const currentMembership = await Membership.findOne({ userId: currentUserId, orgId }).lean()
    if (!currentMembership || currentMembership.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can remove members' }, { status: 403 })
    }

    // Prevent removing yourself
    if (params.userId === currentUserId) {
      return NextResponse.json({ error: 'Cannot remove yourself from the organization' }, { status: 400 })
    }

    // Prevent removing the last admin
    const targetMembership = await Membership.findOne({ userId: params.userId, orgId }).lean()
    if (targetMembership?.role === 'admin') {
      const adminCount = await Membership.countDocuments({ orgId, role: 'admin' })
      if (adminCount <= 1) {
        return NextResponse.json({ error: 'Cannot remove the last admin' }, { status: 400 })
      }
    }

    // Delete membership
    const result = await Membership.deleteOne({ userId: params.userId, orgId })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Membership not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Member removed successfully' })
  } catch (error: any) {
    console.error('Error removing member:', error)
    return NextResponse.json({ error: error.message || 'Failed to remove member' }, { status: 500 })
  }
}




