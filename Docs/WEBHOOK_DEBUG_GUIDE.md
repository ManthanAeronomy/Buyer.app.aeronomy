# 🔍 MongoDB Webhook Debugging Guide

## What You'll See After Sign-Up

When you complete a sign-up, your terminal will show detailed logs about whether the user was saved to MongoDB Atlas.

---

## ✅ Successful Sign-Up Flow (Terminal Output)

### Step 1: Webhook Received
```
🌐 ===== WEBHOOK RECEIVED =====
🕐 Timestamp: 2025-11-07T10:30:45.123Z
🔐 Webhook ID: msg_2X3Y4Z5A6B7C8D9E0F1G
🔐 Signature: ✓ Present
📦 Event Type: user.created
📄 Payload received, verifying signature...
✅ Signature verified
🎯 Processing event: user.created
=============================
```

### Step 2: User Created Event
```
🔔 ===== CLERK WEBHOOK: USER CREATED =====
📧 Email: test@example.com
🆔 Clerk ID: user_2abcdefghijklmnopqrs
👤 Username: testuser
📝 Attempting to save to MongoDB Atlas...
```

### Step 3: MongoDB Operations
```
💾 [User Service] Connecting to MongoDB...
✅ MongoDB Atlas connected successfully
📊 Database: aeronomy-saf-marketplace
💾 [User Service] MongoDB connected
💾 [User Service] Upserting user: {
  clerkId: 'user_2abcdefghijklmnopqrs',
  email: 'test@example.com',
  username: 'testuser'
}
💾 [User Service] User upserted successfully: {
  mongoId: 673c8e9f5a4b3c2d1e0f9g8h,
  email: 'test@example.com',
  isNew: true
}
```

### Step 4: Success Confirmation
```
✅ SUCCESS! User saved to MongoDB Atlas
📊 MongoDB Document ID: 673c8e9f5a4b3c2d1e0f9g8h
📧 Email: test@example.com
🔐 Email Verified: Yes
🕐 Created At: 2025-11-07T10:30:45.234Z
========================================
```

---

## ❌ Failed Sign-Up Flow (Terminal Output)

### If MongoDB Connection Fails
```
🌐 ===== WEBHOOK RECEIVED =====
...
🔔 ===== CLERK WEBHOOK: USER CREATED =====
📧 Email: test@example.com
🆔 Clerk ID: user_2abcdefghijklmnopqrs
📝 Attempting to save to MongoDB Atlas...
💾 [User Service] Connecting to MongoDB...
❌ MongoDB Atlas connection error: getaddrinfo ENOTFOUND cluster0.mongodb.net

❌ FAILED! Could not save user to MongoDB Atlas
❌ Error: MongoDB URI is not configured. Please add MONGODB_URI to your environment variables.
❌ Stack: Error: MongoDB URI is not configured...
========================================

❌ ===== WEBHOOK ERROR =====
❌ Error processing webhook: MongoDB URI is not configured
❌ Stack: Error: MongoDB URI is not configured...
===========================
```

### If User Validation Fails
```
🔔 ===== CLERK WEBHOOK: USER CREATED =====
📧 Email: invalid-email
🆔 Clerk ID: user_2abcdefghijklmnopqrs
📝 Attempting to save to MongoDB Atlas...
💾 [User Service] Connecting to MongoDB...
💾 [User Service] MongoDB connected
💾 [User Service] Upserting user: { ... }

❌ FAILED! Could not save user to MongoDB Atlas
❌ Error: User validation failed: email: Please provide a valid email
========================================
```

---

## 🔔 Other Webhook Events You'll See

### Session Created (Login)
```
🔔 ===== CLERK WEBHOOK: SESSION CREATED =====
🆔 User ID: user_2abcdefghijklmnopqrs
📝 Updating last login in MongoDB Atlas...
💾 [User Service] Updating last login for: user_2abcdefghijklmnopqrs
💾 [User Service] Last login updated: test@example.com
✅ SUCCESS! Last login timestamp updated
========================================
```

### User Updated
```
🔔 ===== CLERK WEBHOOK: USER UPDATED =====
📧 Email: test@example.com
🆔 Clerk ID: user_2abcdefghijklmnopqrs
📝 Attempting to update in MongoDB Atlas...
✅ SUCCESS! User updated in MongoDB Atlas
📊 MongoDB Document ID: 673c8e9f5a4b3c2d1e0f9g8h
🕐 Updated At: 2025-11-07T10:35:12.456Z
========================================
```

### User Deleted
```
🔔 ===== CLERK WEBHOOK: USER DELETED =====
🆔 Clerk ID: user_2abcdefghijklmnopqrs
📝 Attempting to delete from MongoDB Atlas...
💾 [User Service] Deleting user: user_2abcdefghijklmnopqrs
💾 [User Service] User deleted successfully
✅ SUCCESS! User deleted from MongoDB Atlas
========================================
```

---

## 🧪 How to Test

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Sign up with a new account:**
   - Go to: http://localhost:3000/sign-up
   - Enter email, password, username
   - Complete email verification

3. **Watch your terminal** for the messages above

4. **Look for this specific message to confirm MongoDB save:**
   ```
   ✅ SUCCESS! User saved to MongoDB Atlas
   ```

---

## 🚨 Common Issues

### Issue 1: No Webhook Logs at All
**Problem:** You don't see any webhook logs after sign-up

**Possible Causes:**
- Webhooks not configured in Clerk Dashboard
- Webhook URL is incorrect
- Your local server isn't publicly accessible (need ngrok/localtunnel)

**Solution:**
- For local testing, webhooks won't work unless you use a tunnel
- Or deploy to Vercel/production where webhooks can reach your API

### Issue 2: Webhook Received but MongoDB Fails
**Problem:** You see webhook logs but MongoDB operations fail

**Possible Causes:**
- `MONGODB_URI` missing from `.env.local`
- MongoDB Atlas network access not configured
- Invalid connection string

**Solution:**
1. Check `.env.local` has `MONGODB_URI`
2. Verify MongoDB Atlas IP whitelist (allow all: 0.0.0.0/0 for development)
3. Test connection with: http://localhost:3000/api/test-db

### Issue 3: User Created in Clerk but Not MongoDB
**Problem:** Account works but no MongoDB document

**Causes:**
- Webhook fired before MongoDB was ready
- Webhook failed silently
- Validation error in user data

**Solution:**
- Check terminal for error logs
- Use manual sync: http://localhost:3000/api/users/sync

---

## 🔧 Manual Verification

### Check if User is in MongoDB
You can manually verify by creating a test endpoint:

```typescript
// app/api/debug/user/[clerkId]/route.ts
import { getUserByClerkId } from '@/lib/user-service'

export async function GET(req: Request, { params }: { params: { clerkId: string } }) {
  const user = await getUserByClerkId(params.clerkId)
  return Response.json({ user })
}
```

Then visit: `http://localhost:3000/api/debug/user/YOUR_CLERK_ID`

---

## 📊 What Success Looks Like

**When everything works, you'll see:**

1. ✅ Sign-up form submits
2. ✅ Email verification succeeds
3. ✅ Session activated
4. ✅ Redirect to dashboard
5. ✅ Webhook received (in terminal)
6. ✅ MongoDB connection successful
7. ✅ User saved to MongoDB
8. ✅ Success message with MongoDB ID

**All within 1-3 seconds of completing sign-up!**

---

## 🆘 Need Help?

If you see **❌ FAILED** messages:
1. Copy the entire error log from terminal
2. Check the error message
3. Verify your `.env.local` configuration
4. Test MongoDB connection: http://localhost:3000/api/test-db

The detailed logs will tell you exactly what went wrong! 🎯

