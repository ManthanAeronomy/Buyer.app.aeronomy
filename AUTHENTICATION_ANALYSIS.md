# Authentication Flow Analysis & Troubleshooting Guide

## Current Setup Overview

### Technology Stack
- **Authentication**: Clerk (v5.0.0)
- **2FA**: Custom OTP system via email (Resend)
- **Database**: MongoDB Atlas (optional)
- **Framework**: Next.js 14 (App Router)

---

## Sign-Up Flow (Step-by-Step)

### 1. User fills sign-up form
- Email (required)
- Username (optional - not sent to Clerk initially)
- Password (required - must meet validation requirements)

### 2. Form submission → `signUp.create()`
```typescript
const result = await signUp.create({
  emailAddress: email,
  password: password,
})
```

### 3. Clerk response status handling

#### ✅ Status: `complete`
- Account created and verified
- Session activated
- → Redirect to OTP verification (`/verify-otp`)

#### ⚠️ Status: `missing_requirements`
- Clerk requires email verification
- Triggers `prepareEmailAddressVerification()`
- Shows verification code input
- User enters code → `attemptEmailAddressVerification()`
- After verification → Redirect to OTP verification

---

## Critical Configuration Requirements

### 1. Clerk Dashboard Configuration

**Required Settings:**
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **User & Authentication**
3. Check **Email, Phone, Username** settings
4. **Email verification strategy**:
   - Option 1: Verification required (user must verify email)
   - Option 2: Email verification optional
   - Option 3: Email verification disabled

**Current Issue**: If "Email verification required", users must verify their email before sign-up completes.

### 2. Environment Variables Required

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Optional: For 2FA OTP emails
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=Aeronomy <noreply@aeronomy.co>

# Optional: For user database storage
MONGODB_URI=mongodb+srv://...
CLERK_WEBHOOK_SECRET=whsec_xxxxx
```

---

## Common Issues & Solutions

### Issue 1: "Cannot initialize Smart CAPTCHA widget"
**Cause**: Using custom sign-up form
**Impact**: None - falls back to Invisible CAPTCHA
**Solution**: Can be ignored, or add `<div id="clerk-captcha"></div>` to form

### Issue 2: Sign-up status `missing_requirements`
**Cause**: Clerk requires email verification
**Solution**: 
- User must enter verification code from email
- OR disable email verification in Clerk Dashboard
- OR use email_link strategy (auto-verify via link)

### Issue 3: "username is not a valid parameter"
**Status**: ✅ FIXED
**Solution**: Username is now optional and set after sign-up

### Issue 4: MongoDB connection warnings
**Status**: ✅ FIXED  
**Impact**: None - MongoDB is optional
**Solution**: Add MONGODB_URI or ignore warnings

### Issue 5: OTP emails not sending
**Cause**: RESEND_API_KEY not configured
**Impact**: 2FA won't work after sign-up
**Solution**: Add Resend API key

---

## Testing Checklist

### Prerequisites
- [ ] Clerk keys configured in `.env.local`
- [ ] Clerk dashboard Email settings configured
- [ ] Development server running (`npm run dev`)

### Sign-Up Test Steps

1. **Navigate to sign-up page**
   ```
   http://localhost:3004/sign-up
   ```

2. **Fill out form**
   - Email: Use a real email you can access
   - Username: Optional
   - Password: Must meet all requirements (8+ chars, uppercase, lowercase, special, number)

3. **Submit form**
   - Check browser console for errors
   - Check terminal for server logs

4. **Expected flow A (Email verification disabled)**
   ```
   Sign up → Account created → Redirect to /verify-otp → Enter OTP → Dashboard
   ```

5. **Expected flow B (Email verification required)**
   ```
   Sign up → Verification code input appears → Check email → Enter code → Redirect to /verify-otp → Enter OTP → Dashboard
   ```

---

## Debugging Steps

### 1. Check Browser Console
Open DevTools (F12) and look for:
- Sign-up result status
- Any error messages
- Network requests to Clerk

### 2. Check Terminal Output
Look for:
- MongoDB connection messages
- Clerk authentication logs
- Any errors

### 3. Verify Clerk Configuration

**In Clerk Dashboard:**
1. Go to **User & Authentication**
2. Check **Email** is enabled
3. Check verification strategy:
   - **Instant**: No verification needed → Sign-up should work immediately
   - **Email code**: Verification code sent → Use verification input
   - **Email link**: Click link to verify → May need email_link strategy

### 4. Test with Different Email

If sign-up fails:
- Try with a different email provider (Gmail, Outlook, etc.)
- Check spam folder for verification emails
- Ensure email is not already registered

---

## Quick Fixes

### Option 1: Disable Email Verification (Fastest)

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. User & Authentication → Email, Phone, Username
3. Find "Email verification"
4. Change to **"Not required"** or **"Optional"**
5. Try sign-up again

### Option 2: Use Custom Clerk Sign-Up Components

Instead of custom form, use Clerk's built-in components:

```tsx
import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return <SignUp routing="path" path="/sign-up" />
}
```

### Option 3: Skip Clerk Email Verification

If you want to use only your OTP system:
1. Set Clerk email verification to "Optional"
2. Sign-up will complete immediately
3. Your OTP system provides the verification

---

## Current File Structure

```
app/
├── sign-up/[[...sign-up]]/page.tsx    ← Custom sign-up form
├── sign-in/[[...sign-in]]/page.tsx    ← Custom sign-in form  
├── verify-otp/page.tsx                ← 2FA OTP verification
├── onboarding/page.tsx                ← Post-verification
├── dashboard/page.tsx                 ← Protected route
└── api/
    ├── auth/otp/
    │   ├── send/route.ts             ← Send OTP email
    │   ├── verify/route.ts           ← Verify OTP code
    │   └── resend/route.ts           ← Resend OTP
    └── webhooks/clerk/route.ts       ← Clerk webhooks (MongoDB sync)

lib/
├── mongodb.ts                         ← MongoDB connection
├── otp.ts                             ← OTP utilities
├── user-service.ts                    ← User CRUD
├── email.ts                           ← Email service
└── email-templates.ts                 ← Email templates

middleware.ts                          ← Route protection
```

---

## Recommended Configuration

For smooth sign-up experience:

1. **Clerk Dashboard**:
   - Email verification: "Optional" or "Not required"
   - Username: Not required
   - Password: Required (with complexity rules)

2. **Your OTP System**:
   - Provides email verification after Clerk sign-up
   - Adds extra security layer
   - Works independently of Clerk

---

## Next Steps

1. **Verify Clerk Configuration**
   - Check email verification settings
   - Ensure keys are in `.env.local`

2. **Test Sign-Up**
   - Use a real email
   - Check console for errors
   - Follow verification prompts

3. **If Still Failing**
   - Share the exact error message
   - Share browser console logs
   - Share terminal output
   - Check Clerk Dashboard logs

---

## Support

If you need help:
1. Check browser console (F12)
2. Check terminal output
3. Share error messages
4. Check [Clerk Documentation](https://clerk.com/docs)
5. Verify Clerk Dashboard settings match expectations

