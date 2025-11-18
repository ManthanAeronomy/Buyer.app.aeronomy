import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { upsertUser } from '@/lib/user-service'

/**
 * API route to manually sync current user with MongoDB
 * Useful as a fallback if webhooks fail or for initial setup
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user data from Clerk
    const clerkUser = await clerkClient.users.getUser(userId)
    const emailAddress = clerkUser.emailAddresses[0]?.emailAddress

    if (!emailAddress) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 })
    }

    // Sync user to MongoDB
    const user = await upsertUser({
      clerkId: userId,
      email: emailAddress,
      username: clerkUser.username || undefined,
      firstName: clerkUser.firstName || undefined,
      lastName: clerkUser.lastName || undefined,
      imageUrl: clerkUser.imageUrl || undefined,
      emailVerified: clerkUser.emailAddresses[0]?.verification?.status === 'verified',
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        username: user.username,
      },
    })
  } catch (error: any) {
    console.error('Error syncing user:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to sync user' },
      { status: 500 }
    )
  }
}

