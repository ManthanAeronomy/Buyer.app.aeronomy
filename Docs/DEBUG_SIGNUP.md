# Debug Sign-Up Issue

## Test Steps

1. **Open Browser Console** (F12)
2. **Go to** `http://localhost:3004/sign-up`
3. **Fill out the form**
4. **Click "Create Account"**
5. **Check Console** - You should see:
   ```
   Sign up result status: missing_requirements
   Missing requirements: ['email_address']
   Email verification code sent. Check your email.
   ```

6. **Check your email** for the Clerk verification code
7. **Enter the code** in the verification input
8. **Click "Verify Email"**
9. **Watch the console** - You should see one of these:

### Success Path:
```
Attempting email verification with code: 123456
Email verification result: complete
✅ Email verified! Creating session...
✅ Session activated!
✅ Redirecting to OTP verification...
```

### Error Paths:

**Invalid Code:**
```
❌ Email verification error: [error details]
```

**Wrong Status:**
```
❌ Verification incomplete. Status: [status]
```

---

## What to Share

After trying to verify, share:

1. **All console messages** (everything from step 3 onwards)
2. **Any error messages** you see on screen
3. **What happens** after clicking "Verify Email"

---

## Common Issues & Fixes

### Issue 1: "Verification blocked"
**Cause**: Code input is empty or Clerk not loaded
**Fix**: Make sure you entered the code from your email

### Issue 2: Invalid/Expired Code
**Cause**: Code is wrong or expired (codes expire after 10 minutes)
**Fix**: 
- Request new code (reload page and start over)
- Check spam folder
- Try different email address

### Issue 3: Status Not "complete"
**Cause**: Clerk configuration issue
**Fix**: Check what status is returned in console, share it

### Issue 4: Session Activation Fails
**Cause**: Clerk keys mismatch or expired
**Fix**: 
- Verify Clerk keys in `.env.local`
- Check Clerk Dashboard for any errors
- Try refreshing Clerk keys

---

## Quick Test: Skip Email Verification

To test if the rest works, temporarily disable email verification:

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. **User & Authentication** → **Email**
3. Set verification to **"Not required"**
4. Try sign-up again
5. Should work immediately without code

---

## Alternative: Use Clerk's Built-in Components

If custom form keeps having issues, try Clerk's components:

Create `app/sign-up/[[...sign-up]]/page.tsx`:

```tsx
import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignUp 
        routing="path" 
        path="/sign-up"
        afterSignUpUrl="/verify-otp?redirect=/onboarding"
      />
    </div>
  )
}
```

This will use Clerk's default UI which handles all verification automatically.

