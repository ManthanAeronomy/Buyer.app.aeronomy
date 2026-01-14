import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { clerkClient } from '@clerk/nextjs/server'
import { Types } from 'mongoose'

/**
 * Get MongoDB User ObjectId from Clerk userId
 * This ensures all modules reference MongoDB User, not Clerk directly
 */
export async function getMongoUserFromClerkId(clerkUserId: string): Promise<Types.ObjectId> {
  await connectDB()
  
  // First, try to find existing user in MongoDB
  let user = await User.findOne({ clerkId: clerkUserId }).lean()
  
  // If user doesn't exist, fetch from Clerk and create in MongoDB
  if (!user) {
    try {
      const clerkUser = await clerkClient.users.getUser(clerkUserId)
      const emailAddress = clerkUser.emailAddresses[0]?.emailAddress || ''
      
      if (!emailAddress) {
        throw new Error(`No email found for Clerk user ${clerkUserId}`)
      }
      
      // Create user in MongoDB
      const newUser = await User.create({
        clerkId: clerkUserId,
        email: emailAddress,
        username: clerkUser.username || undefined,
        firstName: clerkUser.firstName || undefined,
        lastName: clerkUser.lastName || undefined,
        imageUrl: clerkUser.imageUrl || undefined,
        emailVerified: clerkUser.emailAddresses[0]?.verification?.status === 'verified',
      })
      
      return newUser._id
    } catch (error) {
      console.error(`Failed to create user from Clerk ID ${clerkUserId}:`, error)
      throw new Error(`User not found and could not be created: ${error}`)
    }
  }
  
  return new Types.ObjectId(user._id)
}

/**
 * Get MongoDB User ObjectId from Clerk userId (syncs if needed)
 * This is the main function other modules should use
 */
export async function resolveMongoUserId(clerkUserId: string): Promise<Types.ObjectId> {
  return await getMongoUserFromClerkId(clerkUserId)
}




