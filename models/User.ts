import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUser extends Document {
  clerkId: string // Clerk user ID
  email: string
  username?: string
  firstName?: string
  lastName?: string
  imageUrl?: string
  emailVerified: boolean
  marketingOptIn: boolean
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
  // Additional custom fields
  organization?: string
  role?: string
  isOnboardingComplete?: boolean
  metadata?: Record<string, any>
}

const UserSchema: Schema<IUser> = new Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    username: {
      type: String,
      trim: true,
      sparse: true, // Allows multiple null values but enforces uniqueness for non-null values
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    marketingOptIn: {
      type: Boolean,
      default: false,
    },
    isOnboardingComplete: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
    },
    organization: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      trim: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
)

// Compound index for faster queries
UserSchema.index({ clerkId: 1, email: 1 })

// Prevent re-compilation during hot reloads in development
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export default User

