# Complete Project Analysis: Aeronomy SAF Marketplace

**Analysis Date:** January 26, 2026  
**Project:** Aeronomy SAF Marketplace (Buyer Dashboard)  
**Framework:** Next.js 14 (App Router)  
**Language:** TypeScript  

---

## 📋 Executive Summary

The **Aeronomy SAF Marketplace** is a full-stack B2B marketplace platform for Sustainable Aviation Fuel (SAF) trading. It enables SAF producers, airlines (buyers), traders, and distributors to connect, trade, and manage compliance in a secure, regulated environment.

### Key Characteristics
- **Architecture:** Monolithic Full-Stack Next.js Application
- **Database:** MongoDB Atlas (NoSQL Document Database)
- **Authentication:** Clerk (authentication only, data stored in MongoDB)
- **Deployment:** AWS ECS (configured), also supports Vercel/Railway
- **Port:** 3004 (default)

---

## 🏗️ Architecture Overview

### Architecture Pattern
- **Type:** Monolithic Full-Stack Application
- **Framework:** Next.js 14 with App Router
- **Deployment Model:** Server-Side Rendered (SSR) + Client-Side Rendered (CSR)
- **API Style:** RESTful API Routes

### Technology Stack

#### Core Framework
- **Next.js:** 14.2.35 (App Router)
- **React:** 18.3.0
- **TypeScript:** 5.4.0

#### Frontend Technologies
- **Styling:** Tailwind CSS 3.4.7
- **Icons:** Lucide React 0.400.0
- **Fonts:** Inter (Google Fonts)
- **Date Handling:** date-fns 4.1.0
- **Maps:** react-simple-maps 3.0.0

#### Backend Technologies
- **Runtime:** Node.js (via Next.js)
- **API:** Next.js API Routes (RESTful)
- **Database:** MongoDB Atlas (via Mongoose 8.0)
- **Authentication:** Clerk 5.0.0
- **Email:** Resend (via custom service)
- **Webhooks:** Svix 1.84.1

#### File Processing
- **PDF Parsing:** pdf-parse 2.4.5
- **OCR:** tesseract.js 6.0.1
- **File Upload:** formidable 3.5.4

---

## 📁 Project Structure

```
Buyer.app.aeronomy/
├── app/                          # Next.js App Router (Frontend + Backend)
│   ├── api/                      # Backend API Routes
│   │   ├── airports/            # Airport-related endpoints
│   │   ├── bids/                 # Bid management endpoints
│   │   ├── certificates/         # Certificate management endpoints
│   │   ├── contracts/            # Contract management endpoints
│   │   ├── health/               # Health check endpoints
│   │   ├── lots/                 # Lot/marketplace endpoints
│   │   ├── organization/         # Organization profile endpoints
│   │   ├── organizations/        # Organization member management
│   │   ├── users/                # User sync endpoints
│   │   └── webhooks/             # Webhook handlers
│   ├── certificates/             # Certificate pages
│   ├── dashboard/                # Dashboard pages
│   ├── onboarding/               # Onboarding flow
│   ├── sign-in/                  # Clerk sign-in pages
│   ├── sign-up/                  # Clerk sign-up pages
│   ├── layout.tsx                # Root layout with ClerkProvider
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
├── components/                    # React Components
│   ├── bids/                     # Bid-related components
│   ├── certificates/             # Certificate components
│   ├── contracts/                # Contract components
│   ├── dashboard/                # Dashboard components
│   ├── marketplace/              # Marketplace components
│   ├── onboarding/               # Onboarding components
│   └── organization/             # Organization components
├── lib/                          # Backend Services & Utilities
│   ├── certificates/             # Certificate services
│   ├── contracts/                # Contract services
│   ├── lots/                     # Lot services
│   ├── webhooks/                 # Webhook services
│   ├── mongodb.ts                # Database connection
│   ├── user-service.ts           # User CRUD operations
│   ├── user-resolver.ts          # Clerk ID to MongoDB User resolver
│   └── storage.ts                # File storage utilities
├── models/                       # Database Models (Mongoose Schemas)
│   ├── User.ts                   # User model
│   ├── Organization.ts           # Organization model
│   ├── Membership.ts             # User-Organization relationship
│   ├── Lot.ts                    # SAF lot model
│   ├── Bid.ts                    # Bid model
│   ├── Contract.ts               # Contract model
│   ├── Certificate.ts            # Certificate model
│   ├── PurchaseOrder.ts          # Purchase order model
│   ├── ActivityLog.ts           # Audit log model
│   └── ...                       # Additional models
├── public/                       # Static Assets
│   ├── images/                   # Image assets
│   └── videos/                   # Video assets
├── types/                        # TypeScript type definitions
├── middleware.ts                 # Route protection middleware
├── next.config.js                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── package.json                  # Dependencies & Scripts
└── docker-compose.yml            # Docker configuration
```

---

## 🎯 Core Features

### 1. User Authentication & Management
- **Clerk Integration:** Handles sign-up, sign-in, session management
- **User Sync:** Automatic sync from Clerk to MongoDB via webhooks
- **Multi-tenant Support:** Users can belong to multiple organizations

### 2. Organization Management
- **Multi-tenant Architecture:** Organizations with role-based access
- **Onboarding Flow:** 12-step onboarding wizard (simplified version implemented)
- **Member Management:** Add/remove members with role assignments
- **Roles:** admin, compliance, buyer, finance, viewer

### 3. Marketplace (Lots)
- **Lot Creation:** Producers can post SAF lots for sale
- **Lot Types:** spot, forward, contract
- **Status Management:** draft, published, reserved, sold, cancelled
- **Filtering & Search:** By status, type, price range, compliance standards
- **Volume & Pricing:** Automatic price-per-unit calculation

### 4. Bidding System
- **Bid Placement:** Buyers can place bids on published lots
- **Bid Status:** pending, accepted, rejected, withdrawn, expired
- **External Bids:** Support for bids from external systems (Producer Dashboard)
- **Bid Management:** Sellers can accept/reject bids

### 5. Contract Management
- **Auto-generation:** Contracts created automatically from accepted bids
- **Contract Numbering:** Auto-generated format (CNT-YYYY-XXXX)
- **Status Tracking:** draft, pending_signature, signed, active, completed, cancelled
- **Digital Signatures:** Support for seller and buyer signatures

### 6. Certificate Management
- **Upload & Processing:** PDF and image upload support
- **OCR Extraction:** Automatic data extraction using pdf-parse and tesseract.js
- **Certificate Types:** ISCC, RSB, CORSIA, other
- **Status Management:** uploaded, validated, expiring, expired, invalid
- **Compliance Tracking:** Linked to lots and purchase orders

### 7. Dashboard
- **Marketplace Overview:** View all published lots
- **My Lots:** Manage own lots (producers)
- **My Bids:** Track bids placed (buyers)
- **My Contracts:** Manage contracts
- **Certificates:** Certificate management workspace
- **Organization Settings:** Member and profile management

---

## 🗄️ Database Schema

### Core Principle
**Clerk is ONLY for authentication.** All user data is stored in MongoDB, and all relationships use MongoDB User ObjectIds, not Clerk IDs.

### Key Models

#### 1. User Model
```typescript
{
  _id: ObjectId                    // Primary key, used everywhere
  clerkId: string (unique)          // Reference to Clerk (for auth only)
  email: string (unique)
  firstName?: string
  lastName?: string
  emailVerified: boolean
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

**Relationships:**
- Referenced by: `Membership.userId`, `Lot.postedBy`, `Bid.bidderId`, `Contract.signedBySeller/Buyer`

#### 2. Organization Model
```typescript
{
  _id: ObjectId
  name: string
  type: 'airline' | 'producer' | 'trader'
  onboardingStatus: 'pending' | 'in_progress' | 'completed'
  // Simplified onboarding fields
  userName?: string
  companyEmail?: string
  teamSize?: string
  headquarters?: string
  // Detailed onboarding data (for future use)
  legalEntity?: {...}
  compliance?: {...}
  operational?: {...}
  safDemand?: {...}
  // ... extensive nested schema
}
```

**Relationships:**
- One-to-Many: `Organization` → `Membership`, `Lot`, `Certificate`

#### 3. Membership Model
```typescript
{
  _id: ObjectId
  orgId: ObjectId (ref: 'Organization')
  userId: ObjectId (ref: 'User')  // MongoDB User, NOT Clerk ID
  role: 'admin' | 'compliance' | 'buyer' | 'finance' | 'viewer'
  createdAt: Date
  updatedAt: Date
}
```

**Indexes:**
- Compound unique: `{ orgId: 1, userId: 1 }` - Ensures one role per user per org

#### 4. Lot Model
```typescript
{
  _id: ObjectId
  orgId: ObjectId (ref: 'Organization')
  postedBy: ObjectId (ref: 'User')  // MongoDB User
  title: string
  type: 'spot' | 'forward' | 'contract'
  status: 'draft' | 'published' | 'reserved' | 'sold' | 'cancelled'
  volume: { amount: number, unit: string }
  pricing: { price: number, currency: string, pricePerUnit?: number }
  delivery?: {...}
  compliance?: { certificates?: ObjectId[], standards?: string[] }
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

**Pre-save Hook:**
- Automatically calculates `pricePerUnit` from `price` and `volume.amount`

#### 5. Bid Model
```typescript
{
  _id: ObjectId
  lotId: ObjectId (ref: 'Lot')
  bidderId: ObjectId (ref: 'User')  // MongoDB User
  volume: { amount: number, unit: string }
  pricing: { price: number, currency: string }
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'expired'
  source?: string  // 'buyer-dashboard-port-3000', 'api'
  externalBidId?: string
  createdAt: Date
  updatedAt: Date
}
```

#### 6. Contract Model
```typescript
{
  _id: ObjectId
  lotId: ObjectId (ref: 'Lot')
  bidId: ObjectId (ref: 'Bid')
  sellerOrgId: ObjectId (ref: 'Organization')
  buyerOrgId?: ObjectId (ref: 'Organization')
  contractNumber: string (unique)  // Auto-generated: CNT-YYYY-XXXX
  status: 'draft' | 'pending_signature' | 'signed' | 'active' | 'completed'
  signedBySeller?: ObjectId (ref: 'User')
  signedByBuyer?: ObjectId (ref: 'User')
  createdAt: Date
  updatedAt: Date
}
```

#### 7. Certificate Model
```typescript
{
  _id: ObjectId
  orgId: ObjectId (ref: 'Organization')
  uploadedBy?: ObjectId (ref: 'User')
  type: 'ISCC' | 'RSB' | 'CORSIA' | 'other'
  issueDate?: Date
  expiryDate?: Date
  file?: {
    storageKey: string
    url: string
    sha256: string  // File integrity hash
    mime: string
    size: number
  }
  extracted?: Record<string, any>  // OCR/extracted data
  status: 'uploaded' | 'validated' | 'expiring' | 'expired' | 'invalid'
  createdAt: Date
  updatedAt: Date
}
```

---

## 🔌 API Endpoints

### Authentication & Users
- `POST /api/users/sync` - Sync Clerk user to MongoDB

### Lots (Marketplace)
- `GET /api/lots` - List lots (public or filtered)
- `POST /api/lots` - Create new lot (authenticated)
- `GET /api/lots/[id]` - Get lot details
- `PUT /api/lots/[id]` - Update lot (authenticated)
- `DELETE /api/lots/[id]` - Delete lot (authenticated)
- `GET /api/lots/external` - External API for Producer Dashboard

### Bids
- `GET /api/bids` - List bids (received or sent, based on `type` param)
- `POST /api/bids` - Create new bid
- `GET /api/bids/[id]` - Get bid details
- `PUT /api/bids/[id]` - Update bid status (accept/reject)

### Contracts
- `GET /api/contracts` - List contracts
- `POST /api/contracts` - Create contract from accepted bid
- `GET /api/contracts/[id]` - Get contract details
- `PUT /api/contracts/[id]` - Update contract

### Certificates
- `GET /api/certificates` - List certificates
- `POST /api/certificates` - Create certificate
- `GET /api/certificates/[id]` - Get certificate details
- `PUT /api/certificates/[id]` - Update certificate
- `DELETE /api/certificates/[id]` - Delete certificate
- `POST /api/certificates/upload` - Upload certificate file (PDF/image)

### Organizations
- `GET /api/organization/profile` - Get organization profile
- `PUT /api/organization/profile` - Create/update organization
- `POST /api/organization/onboarding/complete` - Mark onboarding complete
- `GET /api/organizations/members` - List organization members
- `POST /api/organizations/members` - Add member to organization
- `PUT /api/organizations/members/[userId]` - Update member role
- `DELETE /api/organizations/members/[userId]` - Remove member
- `GET /api/organizations/producers` - List producer organizations

### Webhooks
- `POST /api/webhooks/clerk` - Clerk user lifecycle webhooks
- `POST /api/webhooks/lots` - Receive lot webhooks (example)

### Health & Testing
- `GET /api/health/mongodb` - MongoDB connection health check
- `GET /api/test-db` - Database connection test

---

## 🔐 Authentication & Authorization

### Authentication Flow
1. User signs up/signs in via Clerk
2. Clerk creates/updates user session
3. Webhook fires: `user.created` or `user.updated`
4. `/api/webhooks/clerk` receives webhook
5. User synced to MongoDB User collection
6. User can now access protected routes

### Middleware Protection
**Public Routes** (no authentication required):
- `/` - Landing page
- `/sign-in/*` - Sign-in pages
- `/sign-up/*` - Sign-up pages
- `/api/webhooks/*` - Webhook endpoints
- `/api/health/*` - Health checks
- `/api/lots/external` - External API
- `/api/lots` (GET) - Public lot listing
- `/api/bids` (POST) - External bid submission

**Protected Routes** (authentication required):
- `/dashboard/*` - All dashboard pages
- `/certificates/*` - Certificate pages
- `/onboarding/*` - Onboarding pages
- `/api/lots` (POST) - Create lot
- `/api/bids` (GET) - View bids
- `/api/contracts/*` - Contract management
- All other API routes

### User Resolution Pattern
All API routes use `resolveMongoUserId()` to convert Clerk `userId` to MongoDB User `ObjectId`:
```typescript
const { userId } = await auth()  // Clerk ID
const mongoUserId = await resolveMongoUserId(userId)  // MongoDB ObjectId
```

---

## 🔗 External Integrations

### 1. Clerk (Authentication)
- **Purpose:** User authentication and identity management
- **Integration:** `@clerk/nextjs` package
- **Webhook:** `/api/webhooks/clerk` - Syncs user lifecycle events
- **Key Feature:** Clerk is **only used for authentication**. All user data is synced to MongoDB.

### 2. MongoDB Atlas (Database)
- **Purpose:** Primary data storage
- **Connection:** `lib/mongodb.ts` with singleton pattern and connection caching
- **Environment:** `MONGODB_URI` in `.env.local`

### 3. Resend (Email)
- **Purpose:** Transactional emails (OTP, notifications)
- **Integration:** `lib/email.ts`
- **Environment:** `RESEND_API_KEY` in `.env.local`

### 4. Producer Dashboard Webhook
- **Purpose:** Notify external Producer Dashboard when lots are created/updated/deleted
- **Events:** `lot.created`, `lot.updated`, `lot.published`, `lot.deleted`
- **Environment:** `PRODUCER_DASHBOARD_WEBHOOK_URL`, `PRODUCER_DASHBOARD_WEBHOOK_SECRET`

### 5. CIST System
- **Purpose:** Centralized SAF trading information system
- **Integration:** Receives all lot events from the marketplace
- **Environment:** `CIST_WEBHOOK_URL`, `CIST_WEBHOOK_SECRET`

---

## 🚀 Development Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Clerk account
- Resend account (for emails)

### Installation
```bash
npm install
```

### Environment Variables (`.env.local`)
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Email (Resend)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=Aeronomy <noreply@aeronomy.co>

# External Integrations
PRODUCER_DASHBOARD_WEBHOOK_URL=https://producer-dashboard.com/api/webhooks/lots
PRODUCER_DASHBOARD_WEBHOOK_SECRET=secret-key
CIST_WEBHOOK_URL=https://cist.aeronomy.app/api/webhooks/lots
CIST_WEBHOOK_SECRET=secret-key
```

### Running the Application
```bash
# Development (auto-detects port)
npm run dev

# Development (direct, port 3004)
npm run dev:direct

# Production build
npm run build
npm start
```

### Port Configuration
- **Default Port:** 3004
- **Script:** `find-port.ps1` (PowerShell) for port detection
- **Dev Command:** `npm run dev` (auto-detects port)

---

## 🐳 Deployment Configuration

### AWS ECS Deployment
- **Dockerfile:** Configured for containerized deployment
- **ECS Task Definition:** `ecs-task-definition.json`
- **ECS Service Definition:** `ecs-service-definition.json`
- **Deployment Guide:** `AWS_ECS_DEPLOYMENT_GUIDE.md`

### Docker Support
- **Dockerfile:** Present in root directory
- **docker-compose.yml:** Available for local development

### Build Configuration
- **Output:** `standalone` (Next.js)
- **Config:** `next.config.js`

---

## 📊 Data Flow Patterns

### Request Flow
```
Client Request
    ↓
Middleware (Clerk Auth Check)
    ↓
Route Handler (app/api/*/route.ts)
    ↓
Service Layer (lib/*/service.ts)
    ↓
Database (MongoDB via Mongoose)
    ↓
Response
```

### User Data Storage Flow
```
Clerk (Authentication Only)
    ↓
Webhook: user.created
    ↓
MongoDB User Collection
    {
      _id: ObjectId("...")        ← Primary key, used everywhere
      clerkId: "user_xxx"          ← Reference only
      email: "user@example.com"
      ...
    }
    ↓
Referenced by:
  - Membership.userId
  - Lot.postedBy
  - Bid.bidderId
  - Contract.signedBySeller/Buyer
```

### Lot Creation Flow
```
User Creates Lot (Frontend)
    ↓
POST /api/lots
    ↓
lib/lots/service.ts → createLot()
    ↓
Resolve Clerk userId → MongoDB User ObjectId
    ↓
Resolve user's organization
    ↓
Save to MongoDB
    ↓
Send Webhook (if configured)
    ↓
Return Created Lot
```

---

## 🎨 Frontend Structure

### Pages (`app/`)
- `/` - Landing page
- `/dashboard` - Main dashboard
- `/dashboard/settings` - Settings page
- `/certificates` - Certificate listing
- `/certificates/[id]` - Certificate detail
- `/onboarding` - Organization onboarding
- `/sign-in` - Clerk sign-in
- `/sign-up` - Clerk sign-up

### Components (`components/`)
- **Dashboard:** `DashboardSidebar`, `DashboardHeader`, `DashboardHome`, `DashboardFooter`
- **Marketplace:** `LotCard`, `LotList`, `LotForm`, `LotDetail`, `MarketplaceOverview`
- **Bids:** `BidCard`, `BidList`
- **Contracts:** `ContractCard`, `ContractList`
- **Certificates:** `CertificateList`, `CertificateUpload`, `CertificateEditor`, `CertificateDetailClient`
- **Onboarding:** `OnboardingWizard` with 12 steps
- **Organization:** `OrganizationMembers`

---

## 🔍 Code Quality & Patterns

### Strengths
1. **Clear Separation of Concerns:** API routes → Services → Models
2. **Type Safety:** Full TypeScript implementation
3. **Consistent Patterns:** User resolution, error handling
4. **Database Indexing:** Proper indexes for performance
5. **Connection Management:** Singleton pattern for MongoDB
6. **Documentation:** Extensive markdown documentation files

### Patterns Used
1. **User Resolution:** `resolveMongoUserId()` pattern ensures all code uses MongoDB ObjectIds
2. **Service Layer:** Business logic separated from API routes
3. **Pre-save Hooks:** Automatic calculations (pricePerUnit, contractNumber)
4. **Webhook Integration:** Non-blocking webhook delivery
5. **Error Handling:** Try-catch blocks with meaningful error messages

---

## ⚠️ Areas for Improvement

### 1. Error Handling
- **Current:** Basic try-catch with console.error
- **Improvement:** Centralized error handling, error logging service, user-friendly error messages

### 2. Testing
- **Current:** No test files found
- **Improvement:** Unit tests for services, integration tests for API routes, E2E tests for critical flows

### 3. Validation
- **Current:** Basic validation in models
- **Improvement:** Input validation middleware (Zod/Yup), API request validation

### 4. Security
- **Current:** Basic authentication via Clerk
- **Improvement:** Rate limiting, input sanitization, CORS configuration, security headers

### 5. Performance
- **Current:** Basic indexing
- **Improvement:** Query optimization, caching strategy (Redis), pagination for large datasets

### 6. Monitoring & Logging
- **Current:** Console.log statements
- **Improvement:** Structured logging (Winston/Pino), error tracking (Sentry), performance monitoring

### 7. Documentation
- **Current:** Extensive markdown files
- **Improvement:** API documentation (OpenAPI/Swagger), inline code documentation (JSDoc)

### 8. File Storage
- **Current:** Local filesystem (`public/uploads/`)
- **Improvement:** Cloud storage (AWS S3, Cloudinary), CDN integration

### 9. Real-time Features
- **Current:** Polling-based updates
- **Improvement:** WebSocket/Server-Sent Events for real-time bid updates, notifications

### 10. Onboarding Flow
- **Current:** Simplified single-step onboarding
- **Improvement:** Full 12-step wizard implementation (schema exists but not fully implemented)

---

## 📝 Key Files Reference

### Configuration Files
- `package.json` - Dependencies and scripts
- `next.config.js` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `middleware.ts` - Route protection

### Core Services
- `lib/mongodb.ts` - Database connection
- `lib/user-resolver.ts` - Clerk to MongoDB user resolution
- `lib/user-service.ts` - User CRUD operations
- `lib/lots/service.ts` - Lot business logic
- `lib/certificates/service.ts` - Certificate business logic
- `lib/contracts/service.ts` - Contract business logic

### Models
- `models/User.ts` - User schema
- `models/Organization.ts` - Organization schema
- `models/Lot.ts` - Lot schema
- `models/Bid.ts` - Bid schema
- `models/Contract.ts` - Contract schema
- `models/Certificate.ts` - Certificate schema

### Documentation
- `README.md` - Project overview
- `COMPREHENSIVE_PROJECT_ANALYSIS.md` - Detailed analysis
- `PROJECT_STRUCTURE_ANALYSIS.md` - Structure breakdown
- `API_USAGE_GUIDE.md` - API documentation
- `AWS_ECS_DEPLOYMENT_GUIDE.md` - Deployment guide

---

## 🎯 Summary

The Aeronomy SAF Marketplace is a **well-structured, production-ready** B2B marketplace platform with:

✅ **Strong Architecture:** Clear separation of concerns, service layer pattern  
✅ **Type Safety:** Full TypeScript implementation  
✅ **Scalable Database:** MongoDB with proper indexing and relationships  
✅ **Secure Authentication:** Clerk integration with MongoDB user sync  
✅ **Comprehensive Features:** Marketplace, bidding, contracts, certificates  
✅ **External Integration:** Webhook support for external systems  
✅ **Documentation:** Extensive documentation files  

**Areas for Growth:**
- Testing infrastructure
- Enhanced error handling and logging
- Performance optimization (caching, pagination)
- Real-time features
- Cloud storage integration
- Full onboarding wizard implementation

The project demonstrates solid engineering practices and is ready for production deployment with the suggested improvements.

---

**End of Analysis**
