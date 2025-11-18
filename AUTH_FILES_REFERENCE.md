# 🔐 Authentication Files Reference

This document lists all files that contain authentication-related code in the Aeronomy SAF Marketplace project.

---

## 📁 Core Authentication Files

### 1. **Middleware & Route Protection**
- **`middleware.ts`** (root)
  - Clerk middleware configuration
  - Public route definitions
  - Route protection logic
  - **Purpose:** Protects routes and handles authentication checks

### 2. **Root Layout & Provider**
- **`app/layout.tsx`**
  - ClerkProvider wrapper
  - Global authentication context
  - **Purpose:** Initializes Clerk authentication for entire app

---

## 🔑 Clerk Authentication Pages

### 3. **Sign-In Page**
- **`app/sign-in/[[...sign-in]]/page.tsx`**
  - Clerk sign-in UI
  - Custom authentication form
  - Video background
  - **Purpose:** User sign-in interface

### 4. **Sign-Up Page**
- **`app/sign-up/[[...sign-up]]/page.tsx`**
  - Clerk sign-up UI
  - Registration form
  - **Purpose:** User registration interface

### 5. **Onboarding Page**
- **`app/onboarding/page.tsx`**
  - Post-signup onboarding flow
  - **Purpose:** User onboarding after registration

---

## 📧 OTP (One-Time Password) Authentication

### 6. **OTP API Routes**
- **`app/api/auth/otp/send/route.ts`**
  - Sends OTP via email
  - Rate limiting
  - **Endpoint:** `POST /api/auth/otp/send`

- **`app/api/auth/otp/verify/route.ts`**
  - Verifies OTP code
  - Validates user email
  - **Endpoint:** `POST /api/auth/otp/verify`

- **`app/api/auth/otp/resend/route.ts`**
  - Resends OTP code
  - **Endpoint:** `POST /api/auth/otp/resend`

### 7. **OTP Service Logic**
- **`lib/otp.ts`**
  - OTP generation
  - OTP storage (in-memory)
  - Rate limiting logic
  - Expiration handling
  - **Purpose:** Core OTP business logic

### 8. **OTP UI Components**
- **`components/OTPInput.tsx`**
  - OTP input field component
  - **Purpose:** User interface for entering OTP codes

- **`app/verify-otp/page.tsx`**
  - OTP verification page
  - **Purpose:** Page where users verify their OTP

### 9. **OTP Email Templates**
- **`components/emails/OTPEmail.tsx`**
  - OTP email template component
  - **Purpose:** Email template for sending OTP

- **`lib/email-templates.ts`**
  - Email template definitions
  - OTP email template
  - **Purpose:** Email template utilities

---

## 👤 User Management & Sync

### 10. **User Service**
- **`lib/user-service.ts`**
  - User CRUD operations
  - User lookup by Clerk ID
  - User creation/update
  - **Purpose:** User data management service

### 11. **User Model**
- **`models/User.ts`**
  - User Mongoose schema
  - User data structure
  - **Purpose:** Database model for users

### 12. **User Sync API**
- **`app/api/users/sync/route.ts`**
  - Syncs Clerk users to MongoDB
  - Manual user synchronization
  - **Endpoint:** `POST /api/users/sync`
  - **Purpose:** Sync user data from Clerk to database

---

## 🔔 Webhooks & User Lifecycle

### 13. **Clerk Webhook Handler**
- **`app/api/webhooks/clerk/route.ts`**
  - Receives Clerk webhook events
  - Handles user.created, user.updated, user.deleted
  - Syncs users to MongoDB
  - **Endpoint:** `POST /api/webhooks/clerk`
  - **Purpose:** Automatic user synchronization from Clerk

---

## 🎨 UI Components

### 14. **Header Component**
- **`components/Header.tsx`**
  - Sign-in/Sign-out buttons
  - User menu
  - Authentication state display
  - **Purpose:** Navigation header with auth controls

### 15. **Sign Out Button**
- **`components/DashboardSignOutButton.tsx`**
  - Sign out functionality
  - **Purpose:** Dashboard sign-out button component

---

## 📚 Documentation Files

### 16. **Authentication Documentation**
- **`README_AUTH.md`**
  - Authentication setup guide
  - Clerk configuration instructions

- **`AUTHENTICATION_ANALYSIS.md`**
  - Detailed authentication analysis
  - Flow diagrams

- **`TEST_AUTH.md`**
  - Authentication testing guide

- **`DEBUG_SIGNUP.md`**
  - Signup debugging guide

- **`TEMP_FIX_SIGNUP.md`**
  - Temporary signup fixes

---

## 🔗 Supporting Files

### 17. **Email Service**
- **`lib/email.ts`**
  - Email sending functionality
  - Resend integration
  - Used for OTP emails
  - **Purpose:** Email delivery service

### 18. **Organization Members**
- **`components/organization/OrganizationMembers.tsx`**
  - User-organization relationships
  - Member management UI
  - **Purpose:** Organization membership management (uses auth)

---

## 📊 Authentication Flow Files

### Flow 1: Clerk Authentication
```
1. app/layout.tsx (ClerkProvider)
   ↓
2. middleware.ts (Route protection)
   ↓
3. app/sign-in/page.tsx (Sign in UI)
   ↓
4. app/api/webhooks/clerk/route.ts (User sync)
   ↓
5. lib/user-service.ts (Save to DB)
```

### Flow 2: OTP Authentication
```
1. app/api/auth/otp/send/route.ts (Send OTP)
   ↓
2. lib/otp.ts (Generate & store OTP)
   ↓
3. lib/email.ts (Send email)
   ↓
4. app/verify-otp/page.tsx (User enters OTP)
   ↓
5. app/api/auth/otp/verify/route.ts (Verify OTP)
```

---

## 🎯 Summary by Category

### **Core Authentication (Clerk)**
- `middleware.ts`
- `app/layout.tsx`
- `app/sign-in/[[...sign-in]]/page.tsx`
- `app/sign-up/[[...sign-up]]/page.tsx`
- `app/api/webhooks/clerk/route.ts`

### **OTP Authentication**
- `app/api/auth/otp/send/route.ts`
- `app/api/auth/otp/verify/route.ts`
- `app/api/auth/otp/resend/route.ts`
- `lib/otp.ts`
- `components/OTPInput.tsx`
- `app/verify-otp/page.tsx`
- `components/emails/OTPEmail.tsx`

### **User Management**
- `lib/user-service.ts`
- `models/User.ts`
- `app/api/users/sync/route.ts`

### **UI Components**
- `components/Header.tsx`
- `components/DashboardSignOutButton.tsx`

### **Supporting Services**
- `lib/email.ts`
- `lib/email-templates.ts`

---

## 🔍 Quick Reference

| File | Purpose | Type |
|------|---------|------|
| `middleware.ts` | Route protection | Middleware |
| `app/layout.tsx` | Clerk provider | Layout |
| `app/sign-in/.../page.tsx` | Sign-in page | Page |
| `app/sign-up/.../page.tsx` | Sign-up page | Page |
| `app/api/webhooks/clerk/route.ts` | User sync webhook | API Route |
| `app/api/auth/otp/send/route.ts` | Send OTP | API Route |
| `app/api/auth/otp/verify/route.ts` | Verify OTP | API Route |
| `lib/otp.ts` | OTP logic | Service |
| `lib/user-service.ts` | User CRUD | Service |
| `models/User.ts` | User schema | Model |

---

**Total Authentication Files: ~18 core files + documentation**



