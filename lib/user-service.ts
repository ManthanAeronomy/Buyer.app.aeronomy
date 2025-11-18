import connectDB from './mongodb'
import User, { IUser } from '@/models/User'

export interface CreateUserData {
  clerkId: string
  email: string
  username?: string
  firstName?: string
  lastName?: string
  imageUrl?: string
  emailVerified?: boolean
  marketingOptIn?: boolean
  organization?: string
  role?: string
  metadata?: Record<string, any>
}

export interface UpdateUserData {
  email?: string
  username?: string
  firstName?: string
  lastName?: string
  imageUrl?: string
  emailVerified?: boolean
  marketingOptIn?: boolean
  lastLoginAt?: Date
  organization?: string
  role?: string
  metadata?: Record<string, any>
}

/**
 * Create a new user in MongoDB
 */
export async function createUser(data: CreateUserData): Promise<IUser> {
  await connectDB()

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ clerkId: data.clerkId }, { email: data.email }],
  })

  if (existingUser) {
    throw new Error('User already exists')
  }

  const user = new User({
    ...data,
    emailVerified: data.emailVerified || false,
    marketingOptIn: data.marketingOptIn || false,
  })

  await user.save()
  return user
}

/**
 * Get user by Clerk ID
 */
export async function getUserByClerkId(clerkId: string): Promise<IUser | null> {
  await connectDB()
  return await User.findOne({ clerkId })
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<IUser | null> {
  await connectDB()
  return await User.findOne({ email: email.toLowerCase().trim() })
}

/**
 * Update user by Clerk ID
 */
export async function updateUserByClerkId(
  clerkId: string,
  data: UpdateUserData
): Promise<IUser | null> {
  await connectDB()

  const updateData: any = { ...data }
  if (updateData.email) {
    updateData.email = updateData.email.toLowerCase().trim()
  }

  return await User.findOneAndUpdate({ clerkId }, updateData, {
    new: true,
    runValidators: true,
  })
}

/**
 * Update or create user (upsert)
 */
export async function upsertUser(data: CreateUserData): Promise<IUser> {
  console.log('💾 [User Service] Connecting to MongoDB...')
  await connectDB()
  console.log('💾 [User Service] MongoDB connected')

  const userData: any = {
    ...data,
    email: data.email.toLowerCase().trim(),
  }

  if (userData.emailVerified === undefined) {
    userData.emailVerified = false
  }
  if (userData.marketingOptIn === undefined) {
    userData.marketingOptIn = false
  }

  console.log('💾 [User Service] Upserting user:', {
    clerkId: data.clerkId,
    email: userData.email,
    username: userData.username || 'N/A',
  })

  const user = await User.findOneAndUpdate(
    { clerkId: data.clerkId },
    userData,
    {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  )

  console.log('💾 [User Service] User upserted successfully:', {
    mongoId: user._id,
    email: user.email,
    isNew: !user.lastLoginAt,
  })

  return user
}

/**
 * Update last login timestamp
 */
export async function updateLastLogin(clerkId: string): Promise<void> {
  console.log('💾 [User Service] Updating last login for:', clerkId)
  await connectDB()
  const result = await User.findOneAndUpdate(
    { clerkId },
    { lastLoginAt: new Date() },
    { upsert: false, new: true }
  )
  
  if (result) {
    console.log('💾 [User Service] Last login updated:', result.email)
  } else {
    console.log('⚠️  [User Service] User not found in MongoDB:', clerkId)
  }
}

/**
 * Delete user by Clerk ID
 */
export async function deleteUserByClerkId(clerkId: string): Promise<boolean> {
  console.log('💾 [User Service] Deleting user:', clerkId)
  await connectDB()
  const result = await User.deleteOne({ clerkId })
  
  if (result.deletedCount > 0) {
    console.log('💾 [User Service] User deleted successfully')
  } else {
    console.log('⚠️  [User Service] User not found in MongoDB:', clerkId)
  }
  
  return result.deletedCount > 0
}

/**
 * Check if user exists
 */
export async function userExists(clerkId: string): Promise<boolean> {
  await connectDB()
  const count = await User.countDocuments({ clerkId })
  return count > 0
}

