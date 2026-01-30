# MongoDB Atlas Integration

This application uses MongoDB Atlas to store user data alongside Clerk authentication.

## Setup

### 1. MongoDB Atlas Configuration

1. Create a MongoDB Atlas account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier is fine for development)
3. Create a database user with read/write permissions
4. Whitelist your IP address (or use `0.0.0.0/0` for development)
5. Get your connection string (it will look like: `mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority`)

### 2. Environment Variables

Add the following to your `.env.local` file:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aeronomy?retryWrites=true&w=majority
```

Replace `username`, `password`, and `cluster` with your actual MongoDB Atlas credentials.

### 3. Clerk Webhook Setup (Recommended)

To automatically sync users with MongoDB when they sign up or update their profile:

1. Go to your [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **Webhooks**
3. Click **Add Endpoint**
4. Enter your webhook URL: `https://yourdomain.com/api/webhooks/clerk`
5. Select the following events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
   - `session.created`
6. Copy the **Signing Secret** and add it to your `.env.local`:

```env
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

## User Schema

The User model includes the following fields:

- `clerkId` (String, required, unique) - Clerk user ID
- `email` (String, required, unique) - User email address
- `username` (String, optional) - Username
- `firstName` (String, optional) - First name
- `lastName` (String, optional) - Last name
- `imageUrl` (String, optional) - Profile image URL
- `emailVerified` (Boolean, default: false) - Email verification status
- `marketingOptIn` (Boolean, default: false) - Marketing consent
- `lastLoginAt` (Date, optional) - Last login timestamp
- `organization` (String, optional) - Organization name
- `role` (String, optional) - User role
- `metadata` (Object, optional) - Additional custom data
- `createdAt` (Date, auto-generated) - Creation timestamp
- `updatedAt` (Date, auto-generated) - Last update timestamp

## Usage

### User Service Functions

The `lib/user-service.ts` file provides the following functions:

- `createUser(data)` - Create a new user
- `getUserByClerkId(clerkId)` - Get user by Clerk ID
- `getUserByEmail(email)` - Get user by email
- `updateUserByClerkId(clerkId, data)` - Update user by Clerk ID
- `upsertUser(data)` - Create or update user (recommended)
- `updateLastLogin(clerkId)` - Update last login timestamp
- `deleteUserByClerkId(clerkId)` - Delete user
- `userExists(clerkId)` - Check if user exists

### Example Usage

```typescript
import { getUserByClerkId, upsertUser } from '@/lib/user-service'

// Get user from MongoDB
const user = await getUserByClerkId('user_xxxxxxxxxxxxx')

// Create or update user
const user = await upsertUser({
  clerkId: 'user_xxxxxxxxxxxxx',
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  marketingOptIn: true,
})
```

### Manual User Sync

If webhooks are not configured, you can manually sync users using the API endpoint:

```typescript
// POST /api/users/sync
// Requires authentication (Clerk session)
```

## Automatic Sync

Users are automatically synced to MongoDB via Clerk webhooks:

- **user.created** - Creates a new user in MongoDB when they sign up
- **user.updated** - Updates user data when profile changes
- **user.deleted** - Removes user from MongoDB when deleted
- **session.created** - Updates last login timestamp

## Database Connection

The MongoDB connection is managed in `lib/mongodb.ts` and uses connection pooling to optimize performance. The connection is cached globally to prevent multiple connections during development hot reloads.

## Indexes

The User schema includes the following indexes for optimal query performance:

- `clerkId` - Unique index for fast lookups
- `email` - Unique index for email lookups
- Compound index on `(clerkId, email)` for combined queries

## Notes

- Users are automatically created/updated via webhooks when configured
- The `upsertUser` function is idempotent - safe to call multiple times
- All email addresses are normalized to lowercase
- The connection string should include the database name (e.g., `...mongodb.net/aeronomy`)

