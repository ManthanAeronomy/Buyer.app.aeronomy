# Clerk Session Configuration

To configure 45-minute inactivity timeout, you need to:

## 1. Clerk Dashboard Configuration

1. Go to https://dashboard.clerk.com
2. Select your application
3. Navigate to **Sessions** section
4. Configure the following:
   - **Inactivity timeout**: 45 minutes (2700 seconds)
   - **Maximum session duration**: Set as needed (e.g., 7 days)

## 2. Middleware Configuration (Already in place)

The middleware in `middleware.ts` already protects routes using Clerk's authentication.

## 3. Environment Variables

Add to your `.env.local`:

```env
# Session configuration is handled by Clerk Dashboard
# These are the standard Clerk environment variables
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_secret

# Optional: Set session lifetime (in seconds)
# CLERK_SESSION_TOKEN_TEMPLATE=default
```

## 4. Session Monitoring (Client-side)

The JWT token is automatically refreshed by Clerk, and sessions expire after 45 minutes of inactivity.
Users will be automatically logged out and redirected to sign-in when their session expires.

## Implementation Notes

- Clerk handles JWT token refresh automatically
- The 45-minute timeout starts from the last activity
- Users are redirected to `/sign-in` when session expires
- Protected routes are configured in `middleware.ts`




