# Comprehensive Project Analysis: Aeronomy SAF Marketplace

## Table of Contents
1. [Project Overview](#project-overview)
2. [Project Structure](#project-structure)
3. [Third-Party Integrations](#third-party-integrations)
4. [Database Schema Analysis](#database-schema-analysis)
5. [Data Flow & Storage](#data-flow--storage)
6. [User Data Entry Process](#user-data-entry-process)

---

## Project Overview

**Aeronomy SAF Marketplace** is a compliance-grade B2B marketplace platform for Sustainable Aviation Fuel (SAF) trading. It connects SAF producers, airlines (buyers), fuel traders, and distributors in a secure, regulated environment.

### Core Functionality
- **User Authentication & Authorization**: Role-based access control
- **Organization Management**: Multi-tenant organization structure
- **SAF Lot Posting**: Producers can post SAF lots for sale
- **Bidding System**: Buyers can place bids on lots
- **Contract Management**: Automated contract generation from accepted bids
- **Certificate Management**: Compliance certificate upload and validation
- **Marketplace Dashboard**: CRM-style interface for managing trading activities

### Technology Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB Atlas (NoSQL Document Database)
- **ODM**: Mongoose 8.0
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Authentication**: Clerk
- **Email**: Resend
- **File Processing**: pdf-parse, tesseract.js (OCR)

---

## Project Structure

### Architecture Overview

This is a **Full-Stack Next.js Application** using the **App Router** architecture pattern. The application combines frontend and backend in a single codebase, following Next.js 14 conventions.

**Architecture Pattern**:
- **Type**: Monolithic Full-Stack Application
- **Framework**: Next.js 14 (App Router)
- **Deployment Model**: Server-Side Rendered (SSR) + Client-Side Rendered (CSR)
- **API Style**: RESTful API Routes

### Directory Structure

```
aeronomy-saf-marketplace/
├── app/                          # Next.js App Router (Frontend + Backend)
│   ├── api/                      # Backend API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   │   └── otp/              # OTP verification
│   │   ├── bids/                 # Bid management
│   │   ├── certificates/         # Certificate management
│   │   ├── contracts/            # Contract management
│   │   ├── lots/                 # Lot/marketplace management
│   │   ├── organization/         # Organization profile
│   │   ├── organizations/        # Organization members
│   │   ├── users/                # User sync
│   │   ├── webhooks/             # Webhook handlers
│   │   └── health/               # Health checks
│   ├── dashboard/                # Dashboard pages
│   ├── certificates/             # Certificate pages
│   ├── onboarding/               # Onboarding flow
│   ├── sign-in/                  # Sign-in pages
│   ├── sign-up/                  # Sign-up pages
│   ├── verify-otp/               # OTP verification page
│   ├── layout.tsx                # Root layout with ClerkProvider
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
├── components/                    # React Components (Frontend)
│   ├── bids/                     # Bid-related components
│   ├── certificates/             # Certificate components
│   ├── contracts/                # Contract components
│   ├── dashboard/                # Dashboard components
│   ├── marketplace/              # Marketplace components
│   ├── onboarding/               # Onboarding components
│   ├── organization/             # Organization components
│   └── emails/                   # Email templates
├── lib/                          # Backend Services & Utilities
│   ├── certificates/             # Certificate services
│   ├── contracts/                # Contract services
│   ├── lots/                     # Lot services
│   ├── webhooks/                 # Webhook services
│   ├── mongodb.ts                # Database connection
│   ├── user-service.ts           # User CRUD operations
│   ├── user-resolver.ts          # Clerk ID to MongoDB User resolver
│   ├── email.ts                  # Email service (Resend)
│   ├── otp.ts                    # OTP management
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
│   └── ActivityLog.ts            # Audit log model
├── public/                       # Static Assets
│   ├── images/                   # Image assets
│   └── videos/                   # Video assets
├── middleware.ts                 # Route protection middleware
├── package.json                  # Dependencies & Scripts
└── tsconfig.json                 # TypeScript configuration
```

### Frontend Structure

#### Pages (`app/`)

| Route | File | Purpose | Auth Required |
|-------|------|---------|---------------|
| `/` | `app/page.tsx` | Landing page | No |
| `/dashboard` | `app/dashboard/page.tsx` | Main dashboard | Yes |
| `/certificates` | `app/certificates/page.tsx` | Certificate listing | Yes |
| `/certificates/[id]` | `app/certificates/[id]/page.tsx` | Certificate detail | Yes |
| `/sign-in` | `app/sign-in/[[...sign-in]]/page.tsx` | Clerk sign-in | No |
| `/sign-up` | `app/sign-up/[[...sign-up]]/page.tsx` | Clerk sign-up | No |
| `/onboarding` | `app/onboarding/page.tsx` | Organization onboarding | Yes |
| `/verify-otp` | `app/verify-otp/page.tsx` | OTP verification | No |

#### React Components (`components/`)

**Dashboard Components**:
- `dashboard/DashboardSidebar.tsx` - Collapsible sidebar navigation
- `dashboard/DashboardHeader.tsx` - Top header with search, notifications, user menu
- `dashboard/DashboardFooter.tsx` - Footer with quick links
- `dashboard/DashboardHome.tsx` - Dashboard overview/home page

**Marketplace Components**:
- `marketplace/LotCard.tsx` - Individual lot display card
- `marketplace/LotList.tsx` - Lot listing with filters and search
- `marketplace/LotForm.tsx` - Lot creation/editing form
- `marketplace/LotDetail.tsx` - Detailed lot view (Salesforce-style record)
- `marketplace/ProducerList.tsx` - Producer directory
- `marketplace/MarketplaceOverview.tsx` - Marketplace dashboard

**Bid Components**:
- `bids/BidList.tsx` - Bid listing with status filters
- `bids/BidCard.tsx` - Individual bid display with actions

**Contract Components**:
- `contracts/ContractList.tsx` - Contract listing
- `contracts/ContractCard.tsx` - Individual contract display

**Certificate Components**:
- `certificates/CertificateList.tsx` - Certificate listing
- `certificates/CertificateUpload.tsx` - File upload component
- `certificates/CertificateEditor.tsx` - Certificate editing
- `certificates/CertificateDetailClient.tsx` - Certificate details
- `certificates/CertificateWorkspace.tsx` - Certificate workspace

**Organization Components**:
- `organization/OrganizationMembers.tsx` - Member management table

**Onboarding Components**:
- `onboarding/OnboardingWizard.tsx` - Single-step onboarding form

**Utility Components**:
- `DashboardSignOutButton.tsx` - Sign out button
- `OTPInput.tsx` - OTP input field
- `emails/OTPEmail.tsx` - Email template component
- `emails/EmailLayout.tsx` - Email layout wrapper

### Backend Structure

#### API Routes (`app/api/`)

**Authentication & Users**:
- `GET/POST /api/auth/otp/send` - Send OTP email
- `POST /api/auth/otp/verify` - Verify OTP code
- `POST /api/auth/otp/resend` - Resend OTP
- `POST /api/users/sync` - Sync Clerk user to MongoDB

**Lots (Marketplace)**:
- `GET /api/lots` - List lots (public or filtered)
- `POST /api/lots` - Create new lot (authenticated)
- `GET /api/lots/[id]` - Get lot details
- `PUT /api/lots/[id]` - Update lot (authenticated)
- `DELETE /api/lots/[id]` - Delete lot (authenticated)
- `GET /api/lots/external` - External API for Producer Dashboard

**Bids**:
- `GET /api/bids` - List bids (received or sent, based on `type` param)
- `POST /api/bids` - Create new bid
- `GET /api/bids/[id]` - Get bid details
- `PUT /api/bids/[id]` - Update bid status (accept/reject)

**Contracts**:
- `GET /api/contracts` - List contracts
- `POST /api/contracts` - Create contract from accepted bid
- `GET /api/contracts/[id]` - Get contract details
- `PUT /api/contracts/[id]` - Update contract

**Certificates**:
- `GET /api/certificates` - List certificates
- `POST /api/certificates` - Create certificate
- `GET /api/certificates/[id]` - Get certificate details
- `PUT /api/certificates/[id]` - Update certificate
- `DELETE /api/certificates/[id]` - Delete certificate
- `POST /api/certificates/upload` - Upload certificate file (PDF/image)

**Organizations**:
- `GET /api/organization/profile` - Get organization profile
- `PUT /api/organization/profile` - Create/update organization
- `POST /api/organization/onboarding/complete` - Mark onboarding complete
- `GET /api/organizations/members` - List organization members
- `POST /api/organizations/members` - Add member to organization
- `PUT /api/organizations/members/[userId]` - Update member role
- `DELETE /api/organizations/members/[userId]` - Remove member
- `GET /api/organizations/producers` - List producer organizations

**Webhooks**:
- `POST /api/webhooks/clerk` - Clerk user lifecycle webhooks
- `POST /api/webhooks/lots` - Receive lot webhooks (example)

**Health & Testing**:
- `GET /api/health/mongodb` - MongoDB connection health check
- `GET /api/test-db` - Database connection test

#### Business Logic Services (`lib/`)

**Core Services**:
- `lib/mongodb.ts` - MongoDB connection utility with singleton pattern and caching
- `lib/user-service.ts` - User CRUD operations (create, update, delete, get by Clerk ID)
- `lib/user-resolver.ts` - Resolves Clerk userId to MongoDB User ObjectId (creates user if doesn't exist)
- `lib/otp.ts` - OTP generation, storage in Clerk metadata, rate limiting
- `lib/storage.ts` - Local file storage utilities (save to `public/uploads/`)

**Domain Services**:
- `lib/lots/service.ts` - Lot business logic (create, update, delete, list, getUserLots)
- `lib/certificates/service.ts` - Certificate business logic (create, update, list, resolveUserOrgId)
- `lib/certificates/extractor.ts` - OCR and data extraction from PDFs/images
- `lib/certificates/status.ts` - Certificate status management (validated, expiring, expired)
- `lib/certificates/types.ts` - Certificate type definitions
- `lib/contracts/service.ts` - Contract business logic (createContractFromBid, getUserContracts)

**Integration Services**:
- `lib/webhooks/lot-webhook.ts` - Send webhooks for lot events (created, updated, deleted, published) to Producer Dashboard and CIST
- `lib/webhooks/buyer-bid-service.ts` - Send bids to Buyer Dashboard (if needed)

**Email Services**:
- `lib/email.ts` - Email sending via Resend API
- `lib/email-templates.ts` - Email template definitions (OTP, notifications)

### Database Models (`models/`)

All models use Mongoose ODM and are stored in MongoDB:

1. **User** - User profiles synced from Clerk
2. **Organization** - Companies/organizations (airlines, producers, traders)
3. **Membership** - User-Organization relationships with roles
4. **Lot** - SAF lots/offerings
5. **Bid** - Bids placed on lots
6. **Contract** - Contracts created from accepted bids
7. **Certificate** - Compliance certificates (ISCC, RSB, CORSIA)
8. **PurchaseOrder** - Purchase orders (future use)
9. **ActivityLog** - Audit trail for all actions

### Middleware (`middleware.ts`)

**Purpose**: Route protection and authentication

**Public Routes** (no authentication required):
- `/` - Landing page
- `/sign-in/*` - Sign-in pages
- `/sign-up/*` - Sign-up pages
- `/api/webhooks/*` - Webhook endpoints
- `/api/health/*` - Health checks
- `/api/lots/external` - External API
- `/api/lots` (GET) - Public lot listing
- `/api/bids` (POST) - External bid submission
- `/verify-otp` - OTP verification

**Protected Routes** (authentication required):
- `/dashboard/*` - All dashboard pages
- `/certificates/*` - Certificate pages
- `/onboarding/*` - Onboarding pages
- `/api/lots` (POST) - Create lot
- `/api/bids` (GET) - View bids
- `/api/contracts/*` - Contract management
- All other API routes

---

## Third-Party Integrations

### 1. **Clerk Authentication** (`@clerk/nextjs`)

**Purpose**: User authentication and identity management

**What It Does**:
- Handles user sign-up, sign-in, and session management
- Provides JWT tokens for authenticated requests
- Manages user profiles (email, name, username, profile images)
- Supports email verification and password reset flows
- Provides webhook system for user lifecycle events

**Integration Points**:
- **Middleware** (`middleware.ts`): Protects routes, validates JWT tokens
- **Webhook Handler** (`app/api/webhooks/clerk/route.ts`): Receives user lifecycle events
  - `user.created`: Syncs new users to MongoDB
  - `user.updated`: Updates user data in MongoDB
  - `user.deleted`: Removes users from MongoDB
  - `session.created`: Updates last login timestamp
- **User Service** (`lib/user-service.ts`): Syncs Clerk users to MongoDB User collection

**Environment Variables**:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...
```

**Data Flow**:
```
User Signs Up → Clerk Creates User → Webhook Fires → MongoDB User Created
User Signs In → Clerk Validates → JWT Token Issued → Middleware Validates → Access Granted
```

**Key Feature**: Clerk is **only used for authentication**. All user data is synced to MongoDB and referenced via MongoDB User ObjectIds throughout the application.

---

### 2. **MongoDB Atlas** (Cloud Database)

**Purpose**: Primary data storage for all application data

**What It Does**:
- Stores all user profiles, organizations, lots, bids, contracts, certificates
- Provides document-based NoSQL storage
- Enables flexible schema for complex nested data structures
- Supports indexes for efficient querying
- Provides connection pooling and automatic failover

**Integration Points**:
- **Connection** (`lib/mongodb.ts`): Singleton connection manager with caching
- **Models** (`models/*.ts`): Mongoose schemas defining data structure
- **Service Layer**: All business logic interacts with MongoDB via Mongoose

**Environment Variables**:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

**Data Storage Strategy**:
- All user data stored in MongoDB (not in Clerk)
- Clerk IDs are stored as `clerkId` field for reference only
- All relationships use MongoDB ObjectIds (not Clerk IDs)
- Automatic timestamps (`createdAt`, `updatedAt`) on all documents

---

### 3. **Resend** (Email Service)

**Purpose**: Transactional email delivery

**What It Does**:
- Sends OTP (One-Time Password) verification emails
- Sends notification emails for bids, contracts, etc.
- Provides email template rendering
- Tracks email delivery status

**Integration Points**:
- **Email Service** (`lib/email.ts`): Wraps Resend API
- **Email Templates** (`lib/email-templates.ts`): HTML email templates
- **OTP Service** (`lib/otp.ts`): Generates and sends OTP codes via email

**Environment Variables**:
```env
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=Aeronomy <noreply@aeronomy.co>
```

**Usage Example**:
```typescript
await sendEmail({
  to: user.email,
  subject: 'Verify Your Email',
  html: renderOTPEmail(otpCode)
})
```

---

### 4. **External Webhook Systems**

#### 4a. **Producer Dashboard Webhook**

**Purpose**: Notify external Producer Dashboard when lots are created/updated/deleted

**What It Does**:
- Sends webhook events when lots are created, updated, published, or deleted
- Includes full lot data and organization information
- Uses Bearer token authentication

**Integration Points**:
- **Webhook Service** (`lib/webhooks/lot-webhook.ts`): Handles webhook delivery
- **Lot Service** (`lib/lots/service.ts`): Triggers webhooks after lot operations

**Environment Variables**:
```env
PRODUCER_DASHBOARD_WEBHOOK_URL=https://producer-dashboard.com/api/webhooks/lots
PRODUCER_DASHBOARD_WEBHOOK_SECRET=secret-key
```

**Events Sent**:
- `lot.created`: New lot posted
- `lot.updated`: Lot details modified
- `lot.published`: Lot status changed to published
- `lot.deleted`: Lot removed

#### 4b. **CIST System** (`cist.aeronomy.app`)

**Purpose**: Centralized SAF trading information system

**What It Does**:
- Receives all lot events from the marketplace
- Maintains centralized registry of SAF lots
- Provides unified view across multiple systems

**Integration Points**:
- **Webhook Service** (`lib/webhooks/lot-webhook.ts`): Sends to CIST webhook endpoint
- Always attempts to send (non-blocking)

**Environment Variables**:
```env
CIST_WEBHOOK_URL=https://cist.aeronomy.app/api/webhooks/lots
CIST_WEBHOOK_SECRET=secret-key
```

**Headers**:
- `X-Source: aeronomy-marketplace`: Identifies source system

---

### 5. **PDF Processing** (`pdf-parse`)

**Purpose**: Extract text and data from PDF certificate documents

**What It Does**:
- Parses PDF files uploaded as certificates
- Extracts text content for OCR processing
- Identifies certificate type (ISCC, RSB, CORSIA, etc.)
- Extracts metadata (issue date, expiry date, volume, etc.)

**Integration Points**:
- **Certificate Extractor** (`lib/certificates/extractor.ts`): Processes PDF files
- **Certificate Upload** (`app/api/certificates/upload/route.ts`): Handles file uploads

**Usage**:
```typescript
const pdfData = await pdfParse(buffer)
const extracted = extractCertificateData(pdfData, 'application/pdf')
```

---

### 6. **OCR Processing** (`tesseract.js`)

**Purpose**: Optical Character Recognition for image-based certificates

**What It Does**:
- Extracts text from image files (PNG, JPEG)
- Converts scanned documents to searchable text
- Used as fallback when PDF parsing fails

**Integration Points**:
- **Certificate Extractor** (`lib/certificates/extractor.ts`): Uses Tesseract for image OCR

**Usage**:
```typescript
const { data: { text } } = await Tesseract.recognize(buffer, 'eng')
```

---

### 7. **File Storage** (Local Filesystem)

**Purpose**: Store uploaded certificate files and documents

**What It Does**:
- Stores files in `public/uploads/` directory
- Generates unique storage keys for files
- Calculates SHA-256 checksums for file integrity
- Provides public URLs for file access

**Integration Points**:
- **Storage Service** (`lib/storage.ts`): File persistence utilities
- **Certificate Upload**: Saves certificate PDFs/images

**Storage Structure**:
```
public/uploads/
  certificates/
    1234567890-abc123.pdf
    1234567891-def456.png
```

**File Metadata Stored**:
- `storageKey`: Path to file
- `url`: Public URL
- `sha256`: File integrity hash
- `mime`: MIME type
- `size`: File size in bytes
- `originalName`: Original filename

---

## Database Schema Analysis

### Database Architecture

**Database Type**: MongoDB (NoSQL Document Database)
**ODM**: Mongoose 8.0
**Connection**: MongoDB Atlas (Cloud) or Local MongoDB
**Connection Management**: Singleton pattern with connection caching (`lib/mongodb.ts`)

### Core Principle

**Clerk is ONLY for authentication**. All user data is stored in MongoDB, and all relationships use MongoDB User ObjectIds, not Clerk IDs.

---

### 1. **User Model** (`models/User.ts`)

**Purpose**: Stores user profile information synced from Clerk

**Schema Structure**:
```typescript
{
  clerkId: string (unique, indexed)        // Reference to Clerk user ID
  email: string (unique, indexed)          // User email address
  username?: string                        // Optional username
  firstName?: string                       // First name
  lastName?: string                        // Last name
  imageUrl?: string                        // Profile image URL
  emailVerified: boolean                   // Email verification status
  marketingOptIn: boolean                  // Marketing consent
  isOnboardingComplete?: boolean           // Onboarding status
  lastLoginAt?: Date                      // Last login timestamp
  organization?: string                   // Legacy field
  role?: string                           // Legacy field
  metadata?: Record<string, any>          // Custom metadata
  createdAt: Date                         // Auto-generated
  updatedAt: Date                         // Auto-generated
}
```

**Indexes**:
- `clerkId` (unique)
- `email` (unique)
- Compound: `{ clerkId: 1, email: 1 }`

**Data Flow**:
1. User signs up via Clerk
2. Clerk webhook fires `user.created`
3. Webhook handler calls `upsertUser()` 
4. User document created/updated in MongoDB
5. All other models reference this User via `_id` (ObjectId)

**Key Relationships**:
- Referenced by: `Membership.userId`, `Lot.postedBy`, `Bid.bidderId`, `Contract.signedBySeller/Buyer`

---

### 2. **Organization Model** (`models/Organization.ts`)

**Purpose**: Represents companies/organizations (airlines, producers, traders)

**Schema Structure**:
```typescript
{
  // Basic Info
  name: string (required)                  // Company name
  type: 'airline' | 'producer' | 'trader' // Organization type
  billingEmail?: string                    // Billing contact email
  plan?: string                            // Subscription plan
  
  // Branding
  branding?: {
    logo?: string
    brandName?: string
  }
  
  // Simplified Onboarding Fields (Current Implementation)
  userName?: string                        // Primary user's name
  companyEmail?: string                   // Company email
  teamSize?: string                       // Team size range
  headquarters?: string                   // Location (US, EU, UK, etc.)
  entityType?: string                     // Corporation, LLC, etc.
  organizationType?: string              // Airline, Producer, Trader, Other
  intent?: string                         // Why they're here
  volumeRange?: string                    // Expected SAF volume
  requirements?: string                   // SAF requirements/goals
  
  // Onboarding Status
  onboardingStatus: 'pending' | 'in_progress' | 'completed'
  
  // Detailed Onboarding Data (For Future Use)
  legalEntity?: {
    legalName: string
    tradingName?: string
    registeredAddress: string
    billingAddress: string
    identifiers: {
      cin?: string                        // Company Identification Number
      vat?: string                        // VAT Number
      lei?: string                        // Legal Entity Identifier
      other?: Map<string, string>
    }
  }
  
  corporateStructure?: {
    parentCompany?: string
    subsidiaries?: string[]
    alliances?: string[]                  // Star Alliance, Oneworld, etc.
  }
  
  contactPoints?: {
    primarySaf?: { name, email, phone, role }
    sustainability?: { name, email, phone, role }
    finance?: { name, email, phone, role }
    legal?: { name, email, phone, role }
  }
  
  compliance?: {
    kyb?: {
      documents: {
        incorporation?: string (URL)
        taxRegistration?: string (URL)
        operatingCertificate?: string (URL)
      }
      sanctionsScreening?: boolean
      pepChecks?: boolean
      status: 'pending' | 'approved' | 'rejected'
    }
    regulatory?: {
      jurisdictions: string[]             // EU, UK, US, etc.
      regimes: string[]                   // CORSIA, EU ETS, etc.
      complianceContacts?: IContactPoint[]
    }
    policies?: {
      termsAccepted: boolean
      termsAcceptedAt?: Date
      dataSharingAccepted: boolean
      documentationRetentionAccepted: boolean
    }
  }
  
  operational?: {
    hubAirports: string[]
    focusAirports?: string[]
    regions: string[]                     // EU, MEA, APAC, Americas
    fuelSuppliers?: { airport, supplier }[]
    logisticPartners?: string[]
    fleet: {
      types: string[]
      annualBlockHours?: number
      annualFuelBurn?: number
    }
  }
  
  safDemand?: {
    targets: {
      adoptionTarget?: number (percentage)
      targetYear?: number
      driver?: 'mandate' | 'voluntary' | 'hybrid'
    }
    volume: {
      requirements: { year, amount, unit }[]
      minVolume?: number
      maxVolume?: number
      spotRatio?: number (0-100)
      longTermRatio?: number (0-100)
    }
    quality: {
      pathways?: string[]                 // HEFA, ATJ, etc.
      feedstockExclusions?: string[]
      minGhgReduction?: number
    }
  }
  
  procurement?: {
    model: {
      strategy?: 'spot' | 'long-term' | 'blended'
      delivery?: 'book-and-claim' | 'physical' | 'hybrid'
      contracting?: 'direct' | 'trader' | 'hybrid'
    }
    tendering: {
      horizon?: string
      minDuration?: number (years)
      lotSize?: { min, max, unit }
    }
    risk: {
      pricingModel?: 'fixed' | 'index-linked' | 'hybrid'
      allowedCurrencies?: string[]
      priceEscalatorsAccepted?: boolean
    }
  }
  
  financial?: {
    billing: {
      entityName?: string
      address?: string
      taxIds?: Map<string, string>
      paymentTerms?: string
      invoicingPreference?: 'shipment' | 'monthly' | 'contract'
    }
    credit: {
      financialsUrl?: string
      creditRating?: string
      creditLimit?: number
      transactionLimit?: number
    }
    payment: {
      methods: string[]
      bankDetails?: {
        bankName: string
        accountNumber: string
        swiftCode: string
        currency: string
      }
    }
  }
  
  sustainability?: {
    certificates: {
      handling?: 'physical' | 'book-and-claim'
      applicationLevel?: 'route' | 'network' | 'corporate'
      stackingAllowed?: boolean
    }
    accounting: {
      frameworks?: string[]
      requiredOutputs?: string[]
      granularity?: string
    }
    audit: {
      accessList?: string[]
      retentionPeriod?: number (years)
    }
  }
  
  governance?: {
    approvalThresholds?: { amount, currency, approverRole }[]
    segregationOfDuties?: boolean
  }
  
  integrations?: {
    erpSystem?: string
    fuelSystem?: string
    esgTool?: string
    dataExchange?: {
      method?: 'api' | 'sftp' | 'portal'
      frequency?: 'real-time' | 'hourly' | 'daily'
    }
  }
  
  createdAt: Date
  updatedAt: Date
}
```

**Indexes**:
- `name` (non-unique)
- `onboardingStatus`

**Key Relationships**:
- One-to-Many: `Organization` → `Membership` (via `orgId`)
- One-to-Many: `Organization` → `Lot` (via `orgId`)
- One-to-Many: `Organization` → `Certificate` (via `orgId`)

---

### 3. **Membership Model** (`models/Membership.ts`)

**Purpose**: Links users to organizations with role-based access

**Schema Structure**:
```typescript
{
  orgId: ObjectId (ref: 'Organization', required, indexed)
  userId: ObjectId (ref: 'User', required, indexed)  // MongoDB User, NOT Clerk ID
  role: 'admin' | 'compliance' | 'buyer' | 'finance' | 'viewer'
  createdAt: Date
  updatedAt: Date
}
```

**Indexes**:
- `orgId` (indexed)
- `userId` (indexed)
- Compound: `{ orgId: 1, userId: 1 }` (unique) - Ensures one role per user per org

**Key Relationships**:
- Many-to-Many: `User` ↔ `Organization` (via `Membership`)
- One `Membership` = One user in one organization with one role

**Role Permissions**:
- **admin**: Full access, can add/remove members
- **compliance**: Certificate and compliance management
- **buyer**: Can place bids, view lots
- **finance**: Financial data access
- **viewer**: Read-only access

---

### 4. **Lot Model** (`models/Lot.ts`)

**Purpose**: Represents a SAF lot/offering posted by a producer or airline

**Schema Structure**:
```typescript
{
  // Ownership
  orgId: ObjectId (ref: 'Organization', required, indexed)
  postedBy: ObjectId (ref: 'User', required, indexed)  // MongoDB User who posted
  airlineName?: string                                 // Display name
  
  // Lot Details
  title: string (required)
  description?: string
  type: 'spot' | 'forward' | 'contract' (required, indexed)
  status: 'draft' | 'published' | 'reserved' | 'sold' | 'cancelled' (required, indexed)
  
  // Volume & Pricing
  volume: {
    amount: number (required, min: 0)
    unit: string (required, default: 'gallons')  // gallons, liters, metric-tons
  }
  pricing: {
    price: number (required, min: 0)              // Total price
    currency: string (required, default: 'USD')
    pricePerUnit?: number                          // Calculated automatically
    paymentTerms?: string
  }
  
  // Delivery
  delivery?: {
    deliveryDate?: Date
    deliveryLocation?: string
    deliveryMethod?: string
    incoterms?: string
  }
  
  // Compliance
  compliance?: {
    certificates?: ObjectId[] (ref: 'Certificate')
    standards?: string[]                          // ISCC, RSB, CORSIA
    ghgReduction?: number (0-100)
    sustainabilityScore?: number (0-100)
  }
  
  // Metadata
  tags?: string[]
  images?: string[]                               // Image URLs
  attachments?: string[]                          // Document URLs
  
  // Dates
  publishedAt?: Date (indexed)
  expiresAt?: Date (indexed)
  reservedAt?: Date
  soldAt?: Date
  
  // Tracking
  views?: number (default: 0)
  inquiries?: number (default: 0)
  
  createdAt: Date
  updatedAt: Date
}
```

**Indexes**:
- `orgId` + `status` (compound)
- `status` + `publishedAt` (compound, descending)
- `type` + `status` (compound)
- `compliance.standards` (array index)
- `createdAt` (descending)

**Pre-Save Hook**:
- Automatically calculates `pricePerUnit` from `price` and `volume.amount`
- Or calculates `price` from `pricePerUnit` and `volume.amount`

**Key Relationships**:
- Many-to-One: `Lot` → `Organization` (via `orgId`)
- Many-to-One: `Lot` → `User` (via `postedBy`)
- One-to-Many: `Lot` → `Bid` (via `lotId`)
- Many-to-Many: `Lot` ↔ `Certificate` (via `compliance.certificates`)

---

### 5. **Bid Model** (`models/Bid.ts`)

**Purpose**: Represents a bid placed by a buyer on a lot

**Schema Structure**:
```typescript
{
  // References
  lotId: ObjectId (ref: 'Lot', required, indexed)
  bidderId: ObjectId (ref: 'User', required, indexed)  // MongoDB User, NOT Clerk ID
  
  // Bidder Info (for display/backward compatibility)
  bidderName?: string
  bidderEmail?: string
  
  // Bid Details
  volume: {
    amount: number (required, min: 0)
    unit: string (required)
  }
  pricing: {
    price: number (required, min: 0)
    currency: string (required, default: 'USD')
    pricePerUnit?: number
    paymentTerms?: string
  }
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'expired' (required, indexed)
  
  // Additional Info
  message?: string
  deliveryDate?: Date
  deliveryLocation?: string
  
  // Metadata
  source?: string                              // 'buyer-dashboard-port-3000', 'api'
  externalBidId?: string (indexed)             // External system bid ID
  expiresAt?: Date (indexed)
  respondedAt?: Date
  
  createdAt: Date
  updatedAt: Date
}
```

**Indexes**:
- `lotId` + `status` (compound)
- `bidderId` + `status` (compound)
- `createdAt` (descending)
- `lotId` + `createdAt` (compound, descending)
- `externalBidId` (for external system lookups)

**Pre-Save Hook**:
- Automatically calculates `pricePerUnit` or `price` based on volume

**Key Relationships**:
- Many-to-One: `Bid` → `Lot` (via `lotId`)
- Many-to-One: `Bid` → `User` (via `bidderId`)
- One-to-One: `Bid` → `Contract` (when accepted, via `bidId`)

---

### 6. **Contract Model** (`models/Contract.ts`)

**Purpose**: Represents a contract created from an accepted bid

**Schema Structure**:
```typescript
{
  // References
  lotId: ObjectId (ref: 'Lot', required, indexed)
  bidId: ObjectId (ref: 'Bid', required, indexed)
  sellerOrgId: ObjectId (ref: 'Organization', required, indexed)
  buyerOrgId?: ObjectId (ref: 'Organization', indexed)
  
  // Buyer Info
  buyerName?: string
  buyerEmail?: string
  
  // Contract Details
  contractNumber: string (required, unique, indexed)  // Auto-generated: CNT-YYYY-XXXX
  title: string (required)
  description?: string
  
  // Volume & Pricing (copied from bid)
  volume: {
    amount: number (required, min: 0)
    unit: string (required)
  }
  pricing: {
    price: number (required, min: 0)
    currency: string (required, default: 'USD')
    pricePerUnit?: number
    paymentTerms?: string
  }
  
  // Delivery
  delivery?: {
    deliveryDate?: Date
    deliveryLocation?: string
    deliveryMethod?: string
    incoterms?: string
  }
  
  // Compliance
  compliance?: {
    standards?: string[]
    certificates?: ObjectId[] (ref: 'Certificate')
  }
  
  // Status
  status: 'draft' | 'pending_signature' | 'signed' | 'active' | 'completed' | 'cancelled' (required, indexed)
  signedAt?: Date
  signedBySeller?: ObjectId (ref: 'User')  // MongoDB User who signed
  signedByBuyer?: ObjectId (ref: 'User')   // MongoDB User who signed
  completedAt?: Date
  
  // Terms
  terms?: string
  attachments?: string[]
  
  createdAt: Date
  updatedAt: Date
}
```

**Indexes**:
- `sellerOrgId` + `status` (compound)
- `buyerOrgId` + `status` (compound)
- `lotId`
- `bidId`
- `contractNumber` (unique)
- `createdAt` (descending)

**Pre-Save Hook**:
- Auto-generates `contractNumber` if not provided: `CNT-YYYY-XXXX`

**Key Relationships**:
- One-to-One: `Contract` → `Bid` (via `bidId`)
- One-to-One: `Contract` → `Lot` (via `lotId`)
- Many-to-One: `Contract` → `Organization` (seller, via `sellerOrgId`)
- Many-to-One: `Contract` → `Organization` (buyer, via `buyerOrgId`)
- Many-to-One: `Contract` → `User` (seller signature, via `signedBySeller`)
- Many-to-One: `Contract` → `User` (buyer signature, via `signedByBuyer`)

---

### 7. **Certificate Model** (`models/Certificate.ts`)

**Purpose**: Stores compliance certificates (ISCC, RSB, CORSIA, etc.)

**Schema Structure**:
```typescript
{
  // Ownership
  orgId: ObjectId (ref: 'Organization', required, indexed)
  supplierId?: ObjectId (ref: 'Organization', indexed)
  uploadedBy?: ObjectId (ref: 'User')  // MongoDB User who uploaded
  
  // Certificate Details
  type: 'ISCC' | 'RSB' | 'CORSIA' | 'other' (required, default: 'other')
  issuingBody?: string
  issueDate?: Date
  expiryDate?: Date (indexed)
  volume?: {
    amount?: number
    unit?: string
  }
  
  // File Storage
  file?: {
    storageKey?: string                   // Path in public/uploads/
    url?: string                          // Public URL
    sha256?: string                       // File integrity hash
    mime?: string                         // MIME type
    size?: number                         // File size in bytes
    originalName?: string                 // Original filename
    pages?: number                        // PDF page count
  }
  
  // Extracted Data
  extracted?: Record<string, any>         // OCR/extracted data
  
  // Status
  status: 'uploaded' | 'validated' | 'expiring' | 'expired' | 'invalid' (required, indexed)
  
  // Compliance
  compliance?: {
    score?: number
    status?: 'valid' | 'warning' | 'invalid'
    issues?: string[]
  }
  
  // Linked Volume
  linkedVolume?: {
    amount?: number
    unit?: string
  }
  
  createdAt: Date
  updatedAt: Date
}
```

**Indexes**:
- `orgId` + `expiryDate` (compound)
- `orgId` + `status` (compound)

**Key Relationships**:
- Many-to-One: `Certificate` → `Organization` (via `orgId`)
- Many-to-One: `Certificate` → `Organization` (supplier, via `supplierId`)
- Many-to-One: `Certificate` → `User` (via `uploadedBy`)
- Many-to-Many: `Certificate` ↔ `Lot` (via `lot.compliance.certificates`)

---

### 8. **PurchaseOrder Model** (`models/PurchaseOrder.ts`)

**Purpose**: Tracks purchase orders (future use)

**Schema Structure**:
```typescript
{
  orgId: ObjectId (ref: 'Organization', required, indexed)
  poNumber: string (required)
  supplierName?: string
  orderDate?: Date
  deliveryDate?: Date
  volumeOrdered?: {
    amount?: number
    unit?: string
  }
  createdBy?: ObjectId (ref: 'User')
  createdAt: Date
  updatedAt: Date
}
```

**Indexes**:
- `orgId` + `poNumber` (compound, unique)

---

### 9. **ActivityLog Model** (`models/ActivityLog.ts`)

**Purpose**: Audit trail for all user actions

**Schema Structure**:
```typescript
{
  orgId: ObjectId (ref: 'Organization', required, indexed)
  userId?: ObjectId (ref: 'User')
  actorType: 'user' | 'supplier' | 'system'
  action: string (required)  // 'uploaded', 'validated', 'linked', etc.
  entity?: {
    type: 'certificate' | 'po' | 'user' | 'org' | 'report' | string
    id: ObjectId | string
  }
  details?: Record<string, any>
  ip?: string
  ua?: string  // User agent
  createdAt: Date
  updatedAt: Date
}
```

**Indexes**:
- `orgId` + `createdAt` (compound, descending)
- `entity.type` + `entity.id` (compound)

---

## Data Flow & Storage

### Authentication Flow

```
1. User visits application
   ↓
2. Clerk middleware checks authentication
   ↓
3. If not authenticated → Redirect to /sign-in
   ↓
4. User signs in via Clerk
   ↓
5. Clerk creates/updates user session
   ↓
6. Webhook fires: user.created or user.updated
   ↓
7. /api/webhooks/clerk receives webhook
   ↓
8. User synced to MongoDB User collection
   ↓
9. User can now access protected routes
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
    firstName: "John"
    lastName: "Doe"
    ...
  }
  ↓
Referenced by:
  - Membership.userId
  - Lot.postedBy
  - Bid.bidderId
  - Contract.signedBySeller/Buyer
```

### Organization Creation Flow

```
1. User completes onboarding form
   ↓
2. POST /api/organization/profile
   ↓
3. Organization created in MongoDB
   {
     _id: ObjectId("...")
     name: "Acme Airlines"
     type: "airline"
     userName: "John Doe"
     companyEmail: "contact@acme.com"
     ...
   }
   ↓
4. Membership created
   {
     orgId: ObjectId("org_id")
     userId: ObjectId("user_id")  ← MongoDB User ObjectId
     role: "admin"
   }
   ↓
5. User redirected to dashboard
```

### Lot Posting Flow

```
1. User clicks "Post New Lot"
   ↓
2. LotForm component collects data
   ↓
3. POST /api/lots
   {
     title: "SAF Lot #123"
     type: "spot"
     volume: { amount: 10000, unit: "gallons" }
     pricing: { price: 50000, currency: "USD" }
     ...
   }
   ↓
4. createLot() service function:
   a. Resolves Clerk userId → MongoDB User ObjectId
   b. Resolves user's organization
   c. Creates Lot document:
      {
        _id: ObjectId("...")
        orgId: ObjectId("org_id")
        postedBy: ObjectId("user_id")  ← MongoDB User ObjectId
        title: "SAF Lot #123"
        status: "draft"
        ...
      }
   ↓
5. Lot saved to MongoDB
   ↓
6. Webhook sent to Producer Dashboard & CIST
   ↓
7. Lot appears in marketplace
```

### Bid Placement Flow

```
1. Buyer views lot and clicks "Place Bid"
   ↓
2. BidForm collects bid data
   ↓
3. POST /api/bids
   {
     lotId: "lot_id"
     bidderId: "clerk_user_id"  ← Clerk ID from auth
     volume: { amount: 5000, unit: "gallons" }
     pricing: { price: 25000, currency: "USD" }
     ...
   }
   ↓
4. POST handler:
   a. Resolves bidderId (Clerk ID) → MongoDB User ObjectId
   b. Creates Bid document:
      {
        _id: ObjectId("...")
        lotId: ObjectId("lot_id")
        bidderId: ObjectId("user_id")  ← MongoDB User ObjectId
        status: "pending"
        ...
      }
   ↓
5. Bid saved to MongoDB
   ↓
6. Seller receives notification
   ↓
7. Seller can accept/reject bid
```

### Contract Creation Flow

```
1. Seller accepts a bid
   ↓
2. PUT /api/bids/[id] { status: "accepted" }
   ↓
3. createContractFromBid() service:
   a. Fetches bid and lot data
   b. Creates Contract document:
      {
        _id: ObjectId("...")
        contractNumber: "CNT-2025-1234"  ← Auto-generated
        lotId: ObjectId("lot_id")
        bidId: ObjectId("bid_id")
        sellerOrgId: ObjectId("seller_org_id")
        buyerOrgId: ObjectId("buyer_org_id")
        volume: { ... }  ← Copied from bid
        pricing: { ... }  ← Copied from bid
        status: "pending_signature"
        ...
      }
   ↓
4. Contract saved to MongoDB
   ↓
5. Both parties can sign contract
   ↓
6. When signed, status → "signed" → "active"
```

---

## User Data Entry Process

### 1. **Onboarding Flow**

**Entry Point**: `/onboarding` page

**Data Collected**:
```typescript
{
  // Personal Info
  name: string                    // User's full name
  companyName: string             // Organization name
  companyEmail: string            // Company email address
  
  // Organization Details
  teamSize: string                // "1-10", "11-50", etc.
  headquarters: string            // "US", "EU", "UK", etc.
  entityType: string              // "Corporation", "LLC", etc.
  organizationType: string        // "airline", "producer", "trader", "other"
  otherOrganizationType?: string  // If "other" selected
  
  // Intent & Requirements
  intent: string                  // "explore", "sell", "compliance", "browsing"
  requirements?: string           // Free text: SAF requirements/goals
}
```

**Storage Process**:
1. User fills form in `OnboardingWizard` component
2. Form submitted to `PUT /api/organization/profile`
3. API handler:
   - Creates `Organization` document in MongoDB
   - Sets `onboardingStatus: 'in_progress'`
   - Creates `Membership` linking user to organization
   - Stores all form data in Organization document
4. Onboarding marked complete: `POST /api/organization/onboarding/complete`
5. User redirected to dashboard

**Database Storage**:
```javascript
// Organization Document
{
  _id: ObjectId("..."),
  name: "Acme Airlines",
  type: "airline",
  userName: "John Doe",
  companyEmail: "contact@acme.com",
  teamSize: "51-200",
  headquarters: "US",
  entityType: "Corporation",
  organizationType: "airline",
  intent: "explore",
  requirements: "Looking for ISCC-certified SAF...",
  onboardingStatus: "completed",
  createdAt: ISODate("2025-01-04T..."),
  updatedAt: ISODate("2025-01-04T...")
}

// Membership Document
{
  _id: ObjectId("..."),
  orgId: ObjectId("org_id"),
  userId: ObjectId("user_id"),  // MongoDB User ObjectId
  role: "admin",
  createdAt: ISODate("2025-01-04T..."),
  updatedAt: ISODate("2025-01-04T...")
}
```

---

### 2. **Lot Posting**

**Entry Point**: Dashboard → "Post New Lot" button

**Data Collected**:
```typescript
{
  // Basic Info
  title: string
  description?: string
  type: 'spot' | 'forward' | 'contract'
  status: 'draft' | 'published'
  
  // Volume
  volumeAmount: number
  volumeUnit: 'gallons' | 'liters' | 'metric-tons'
  
  // Pricing
  pricePerUnit: number
  currency: 'USD' | 'EUR' | 'GBP'
  paymentTerms?: string
  
  // Delivery
  deliveryDate?: string
  deliveryLocation?: string
  deliveryMethod?: string
  incoterms?: string
  
  // Compliance
  standards?: string[]  // ['ISCC', 'RSB', 'CORSIA']
  ghgReduction?: number
  
  // Metadata
  tags?: string[]
  airlineName?: string
}
```

**Storage Process**:
1. User fills `LotForm` component
2. Form submitted to `POST /api/lots` or `PUT /api/lots/[id]`
3. API handler:
   - Gets authenticated user's Clerk ID
   - Resolves to MongoDB User ObjectId via `resolveMongoUserId()`
   - Resolves user's organization via `resolveUserOrgId()`
   - Creates/updates `Lot` document
4. Lot saved to MongoDB
5. Webhook sent to external systems (Producer Dashboard, CIST)

**Database Storage**:
```javascript
// Lot Document
{
  _id: ObjectId("..."),
  orgId: ObjectId("org_id"),           // Organization posting the lot
  postedBy: ObjectId("user_id"),        // MongoDB User who posted
  title: "Premium SAF Lot - ISCC Certified",
  description: "High-quality SAF with 80% GHG reduction...",
  type: "spot",
  status: "published",
  volume: {
    amount: 10000,
    unit: "gallons"
  },
  pricing: {
    price: 50000,                       // Total price
    pricePerUnit: 5.0,                 // Calculated: price / volume.amount
    currency: "USD",
    paymentTerms: "Net 30"
  },
  delivery: {
    deliveryDate: ISODate("2025-02-01"),
    deliveryLocation: "JFK Airport",
    deliveryMethod: "Pipeline",
    incoterms: "FOB"
  },
  compliance: {
    standards: ["ISCC", "CORSIA"],
    ghgReduction: 80,
    certificates: [ObjectId("cert_id_1"), ObjectId("cert_id_2")]
  },
  tags: ["premium", "iscc", "spot"],
  publishedAt: ISODate("2025-01-04T..."),
  createdAt: ISODate("2025-01-04T..."),
  updatedAt: ISODate("2025-01-04T...")
}
```

---

### 3. **Bid Placement**

**Entry Point**: Lot detail view → "Place Bid" button

**Data Collected**:
```typescript
{
  lotId: string
  volume: {
    amount: number
    unit: string
  }
  pricing: {
    price: number
    currency: string
    pricePerUnit?: number
    paymentTerms?: string
  }
  message?: string
  deliveryDate?: string
  deliveryLocation?: string
}
```

**Storage Process**:
1. Buyer fills bid form
2. Form submitted to `POST /api/bids`
3. API handler:
   - Gets authenticated user's Clerk ID from `auth()`
   - Resolves to MongoDB User ObjectId
   - Validates lot exists and is published
   - Creates `Bid` document
4. Bid saved to MongoDB
5. Seller receives notification

**Database Storage**:
```javascript
// Bid Document
{
  _id: ObjectId("..."),
  lotId: ObjectId("lot_id"),
  bidderId: ObjectId("user_id"),       // MongoDB User who placed bid
  bidderName: "Acme Airlines",         // For display
  bidderEmail: "buyer@acme.com",       // For display
  volume: {
    amount: 5000,
    unit: "gallons"
  },
  pricing: {
    price: 25000,
    pricePerUnit: 5.0,
    currency: "USD",
    paymentTerms: "Net 30"
  },
  status: "pending",
  message: "Interested in this lot for Q2 delivery",
  deliveryDate: ISODate("2025-04-01"),
  deliveryLocation: "LAX Airport",
  source: "buyer-dashboard-port-3000",
  createdAt: ISODate("2025-01-04T..."),
  updatedAt: ISODate("2025-01-04T...")
}
```

---

### 4. **Certificate Upload**

**Entry Point**: Dashboard → Certificates → "Upload Certificate"

**Data Collected**:
- File upload (PDF or image)
- Certificate type (ISCC, RSB, CORSIA, other)
- Optional: Issue date, expiry date, volume

**Storage Process**:
1. User uploads file via `CertificateUpload` component
2. File sent to `POST /api/certificates/upload`
3. API handler:
   - Saves file to `public/uploads/certificates/`
   - Calculates SHA-256 hash
   - Extracts text using `pdf-parse` or `tesseract.js`
   - Parses certificate data (dates, volume, etc.)
   - Creates `Certificate` document
4. Certificate saved to MongoDB
5. Status calculated based on expiry date

**Database Storage**:
```javascript
// Certificate Document
{
  _id: ObjectId("..."),
  orgId: ObjectId("org_id"),
  uploadedBy: ObjectId("user_id"),     // MongoDB User who uploaded
  type: "ISCC",
  issuingBody: "ISCC System",
  issueDate: ISODate("2024-01-01"),
  expiryDate: ISODate("2025-12-31"),
  volume: {
    amount: 50000,
    unit: "gallons"
  },
  file: {
    storageKey: "certificates/1736000000-abc123.pdf",
    url: "/uploads/certificates/1736000000-abc123.pdf",
    sha256: "a1b2c3d4e5f6...",
    mime: "application/pdf",
    size: 245678,
    originalName: "ISCC_Certificate_2024.pdf",
    pages: 3
  },
  extracted: {
    text: "ISCC Certificate...",
    engine: "pdf",
    issueDate: "2024-01-01",
    expiryDate: "2025-12-31",
    volume: "50000 gallons"
  },
  status: "validated",
  compliance: {
    score: 95,
    status: "valid",
    issues: []
  },
  createdAt: ISODate("2025-01-04T..."),
  updatedAt: ISODate("2025-01-04T...")
}
```

---

### 5. **Organization Member Management**

**Entry Point**: Dashboard → Organization → "Add Member"

**Data Collected**:
```typescript
{
  clerkUserId: string  // Clerk user ID of user to add
  role: 'admin' | 'compliance' | 'buyer' | 'finance' | 'viewer'
}
```

**Storage Process**:
1. Admin enters Clerk user ID and selects role
2. Form submitted to `POST /api/organizations/members`
3. API handler:
   - Validates current user is admin
   - Resolves Clerk user ID to MongoDB User ObjectId
   - Creates `Membership` document
4. Membership saved to MongoDB
5. User now has access to organization

**Database Storage**:
```javascript
// Membership Document
{
  _id: ObjectId("..."),
  orgId: ObjectId("org_id"),
  userId: ObjectId("user_id"),         // MongoDB User ObjectId
  role: "buyer",
  createdAt: ISODate("2025-01-04T..."),
  updatedAt: ISODate("2025-01-04T...")
}
```

---

## Key Data Storage Principles

### 1. **Clerk is Authentication Only**
- Clerk provides `userId` (Clerk ID) for authentication
- All user data stored in MongoDB `User` collection
- All relationships use MongoDB User `_id` (ObjectId), not Clerk ID
- `clerkId` field in User document is for reference only

### 2. **MongoDB is Source of Truth**
- All business data stored in MongoDB
- User profiles, organizations, lots, bids, contracts, certificates
- All relationships use MongoDB ObjectIds
- Automatic timestamps on all documents

### 3. **Data Relationships**
```
User (MongoDB)
  ↓ (via userId)
Membership
  ↓ (via orgId)
Organization
  ↓ (via orgId)
Lot
  ↓ (via lotId)
Bid
  ↓ (via bidId)
Contract
```

### 4. **Indexing Strategy**
- All foreign keys indexed for fast lookups
- Compound indexes for common query patterns
- Status fields indexed for filtering
- Date fields indexed for sorting

### 5. **Data Integrity**
- Unique constraints on critical fields (email, contractNumber)
- Required fields enforced at schema level
- Pre-save hooks for calculated fields (pricePerUnit, contractNumber)
- Referential integrity via Mongoose references

---

## Summary

The Aeronomy SAF Marketplace uses a **hybrid authentication + data storage** architecture:

- **Clerk**: Handles authentication only (sign-up, sign-in, sessions)
- **MongoDB**: Stores all business data and user profiles
- **Resend**: Sends transactional emails
- **Webhooks**: Integrates with external systems (Producer Dashboard, CIST)
- **File Processing**: PDF parsing and OCR for certificate extraction

All user-entered data flows through the application layers:
1. **UI Component** → Collects user input
2. **API Route** → Validates and processes request
3. **Service Layer** → Business logic and data transformation
4. **MongoDB** → Persistent storage
5. **Webhooks/Notifications** → External system integration

The database schema is designed for scalability, with proper indexing, relationships, and data integrity constraints to support a high-volume B2B marketplace.
