# 📊 Aeronomy SAF Marketplace - Project Structure Analysis

**Generated:** 2025-01-17  
**Project:** Aeronomy SAF Marketplace  
**Port:** 3004 (default)

---

## 🏗️ Architecture Overview

This is a **Full-Stack Next.js Application** using the **App Router** architecture pattern. The application combines frontend and backend in a single codebase, following Next.js 14 conventions.

### Architecture Pattern
- **Type:** Monolithic Full-Stack Application
- **Framework:** Next.js 14 (App Router)
- **Deployment Model:** Server-Side Rendered (SSR) + Client-Side Rendered (CSR)
- **API Style:** RESTful API Routes

---

## 📁 Project Structure

```
aeronomy-saf-marketplace/
├── app/                          # Next.js App Router (Frontend + Backend)
│   ├── api/                      # Backend API Routes
│   ├── dashboard/                # Frontend Pages
│   ├── certificates/             # Frontend Pages
│   ├── sign-in/                  # Frontend Pages
│   ├── sign-up/                  # Frontend Pages
│   ├── layout.tsx                # Root Layout
│   ├── page.tsx                  # Home Page
│   └── globals.css               # Global Styles
├── components/                    # React Components (Frontend)
├── lib/                          # Backend Services & Utilities
├── models/                       # Database Models (Mongoose Schemas)
├── public/                       # Static Assets
├── middleware.ts                 # Route Protection Middleware
└── package.json                  # Dependencies & Scripts
```

---

## 🎨 Frontend Structure

### Location
- **Primary:** `app/` directory (Next.js App Router pages)
- **Components:** `components/` directory
- **Styles:** `app/globals.css` + Tailwind CSS

### Frontend Pages (`app/`)

| Route | File | Purpose |
|-------|------|---------|
| `/` | `app/page.tsx` | Landing page (Hero, Features, CTA) |
| `/dashboard` | `app/dashboard/page.tsx` | Main dashboard (Marketplace, Lots, Bids, Contracts) |
| `/certificates` | `app/certificates/page.tsx` | Certificate listing page |
| `/certificates/[id]` | `app/certificates/[id]/page.tsx` | Certificate detail page |
| `/sign-in` | `app/sign-in/[[...sign-in]]/page.tsx` | Clerk authentication sign-in |
| `/sign-up` | `app/sign-up/[[...sign-up]]/page.tsx` | Clerk authentication sign-up |
| `/verify-otp` | `app/verify-otp/page.tsx` | OTP verification page |
| `/onboarding` | `app/onboarding/page.tsx` | User onboarding flow |

### React Components (`components/`)

#### Layout Components
- `Header.tsx` - Navigation header with auth buttons
- `Footer.tsx` - Site footer
- `dashboard/DashboardNavbar.tsx` - Top navigation bar
- `dashboard/DashboardSidebar.tsx` - Sidebar navigation (legacy)

#### Feature Components
- `Hero.tsx` - Landing page hero section
- `Features.tsx` - Features showcase
- `HowItWorks.tsx` - Process explanation
- `Compliance.tsx` - Compliance information
- `CTA.tsx` - Call-to-action section

#### Marketplace Components
- `marketplace/LotCard.tsx` - Lot display card
- `marketplace/LotForm.tsx` - Lot creation/editing form
- `marketplace/LotList.tsx` - Lot listing with filters
- `marketplace/SetupTestOrgButton.tsx` - Test organization setup

#### Certificate Components
- `certificates/CertificateList.tsx` - Certificate listing
- `certificates/CertificateUpload.tsx` - File upload component
- `certificates/CertificateEditor.tsx` - Certificate editing
- `certificates/CertificateDetailClient.tsx` - Certificate details
- `certificates/CertificateWorkspace.tsx` - Certificate workspace

#### Bid Components
- `bids/BidList.tsx` - Bid listing with filters
- `bids/BidCard.tsx` - Individual bid display

#### Contract Components
- `contracts/ContractList.tsx` - Contract listing
- `contracts/ContractCard.tsx` - Individual contract display

#### Organization Components
- `organization/OrganizationMembers.tsx` - Member management

#### Utility Components
- `DashboardSignOutButton.tsx` - Sign out button
- `OTPInput.tsx` - OTP input field
- `emails/OTPEmail.tsx` - Email template component
- `emails/EmailLayout.tsx` - Email layout wrapper

---

## ⚙️ Backend Structure

### Location
- **API Routes:** `app/api/` directory
- **Business Logic:** `lib/` directory
- **Database Models:** `models/` directory

### API Routes (`app/api/`)

#### Authentication & Users
| Endpoint | Method | File | Purpose |
|----------|--------|------|---------|
| `/api/auth/otp/send` | POST | `app/api/auth/otp/send/route.ts` | Send OTP email |
| `/api/auth/otp/verify` | POST | `app/api/auth/otp/verify/route.ts` | Verify OTP code |
| `/api/auth/otp/resend` | POST | `app/api/auth/otp/resend/route.ts` | Resend OTP |
| `/api/users/sync` | POST | `app/api/users/sync/route.ts` | Sync Clerk users to DB |

#### Lots (Marketplace)
| Endpoint | Method | File | Purpose |
|----------|--------|------|---------|
| `/api/lots` | GET, POST | `app/api/lots/route.ts` | List/create lots |
| `/api/lots/[id]` | GET, PUT, DELETE | `app/api/lots/[id]/route.ts` | Get/update/delete lot |
| `/api/lots/external` | GET | `app/api/lots/external/route.ts` | External API (for Producer Dashboard) |

#### Bids
| Endpoint | Method | File | Purpose |
|----------|--------|------|---------|
| `/api/bids` | GET, POST | `app/api/bids/route.ts` | List/create bids |
| `/api/bids/[id]` | GET, PUT | `app/api/bids/[id]/route.ts` | Get/update bid (accept/reject) |

#### Certificates
| Endpoint | Method | File | Purpose |
|----------|--------|------|---------|
| `/api/certificates` | GET, POST | `app/api/certificates/route.ts` | List/create certificates |
| `/api/certificates/[id]` | GET, PUT, DELETE | `app/api/certificates/[id]/route.ts` | Get/update/delete certificate |
| `/api/certificates/upload` | POST | `app/api/certificates/upload/route.ts` | Upload certificate file |

#### Contracts
| Endpoint | Method | File | Purpose |
|----------|--------|------|---------|
| `/api/contracts` | GET, POST | `app/api/contracts/route.ts` | List/create contracts |
| `/api/contracts/[id]` | GET, PUT | `app/api/contracts/[id]/route.ts` | Get/update contract |

#### Organizations
| Endpoint | Method | File | Purpose |
|----------|--------|------|---------|
| `/api/organizations/members` | GET, POST | `app/api/organizations/members/route.ts` | List/add members |
| `/api/organizations/members/[userId]` | DELETE | `app/api/organizations/members/[userId]/route.ts` | Remove member |

#### Webhooks
| Endpoint | Method | File | Purpose |
|----------|--------|------|---------|
| `/api/webhooks/clerk` | POST | `app/api/webhooks/clerk/route.ts` | Clerk user lifecycle webhooks |
| `/api/webhooks/lots` | POST | `app/api/webhooks/lots/route.ts` | Receive lot webhooks (example) |

#### Health & Testing
| Endpoint | Method | File | Purpose |
|----------|--------|------|---------|
| `/api/health/mongodb` | GET | `app/api/health/mongodb/route.ts` | MongoDB connection health check |
| `/api/test-db` | GET | `app/api/test-db/route.ts` | Database connection test |
| `/api/test/setup-org` | POST | `app/api/test/setup-org/route.ts` | Create test organization |

### Business Logic Services (`lib/`)

#### Core Services
- `lib/mongodb.ts` - MongoDB connection utility with caching
- `lib/user-service.ts` - User CRUD operations
- `lib/otp.ts` - OTP generation, storage, and rate limiting
- `lib/storage.ts` - Local file storage utility

#### Domain Services
- `lib/lots/service.ts` - Lot business logic (create, update, delete, list)
- `lib/certificates/service.ts` - Certificate business logic
- `lib/certificates/extractor.ts` - OCR and data extraction from PDFs
- `lib/certificates/status.ts` - Certificate status management
- `lib/certificates/types.ts` - Certificate type definitions
- `lib/contracts/service.ts` - Contract business logic

#### Integration Services
- `lib/webhooks/lot-webhook.ts` - Send webhooks for lot events
- `lib/webhooks/buyer-bid-service.ts` - Send bids to Buyer Dashboard

#### Email Services
- `lib/email.ts` - Email sending (Resend integration)
- `lib/email-templates.ts` - Email template definitions

---

## 🗄️ Database Structure

### Database Technology
- **Type:** MongoDB (NoSQL Document Database)
- **ODM:** Mongoose (Object Document Mapper)
- **Connection:** MongoDB Atlas (Cloud) or Local MongoDB
- **Connection File:** `lib/mongodb.ts`

### Database Models (`models/`)

| Model | File | Purpose |
|-------|------|---------|
| **User** | `models/User.ts` | User accounts (synced from Clerk) |
| **Organization** | `models/Organization.ts` | Organizations/companies |
| **Membership** | `models/Membership.ts` | User-Organization relationships |
| **Lot** | `models/Lot.ts` | SAF lots/offerings |
| **Bid** | `models/Bid.ts` | Bids on lots |
| **Contract** | `models/Contract.ts` | Contracts from accepted bids |
| **Certificate** | `models/Certificate.ts` | Compliance certificates |
| **PurchaseOrder** | `models/PurchaseOrder.ts` | Purchase orders |
| **ActivityLog** | `models/ActivityLog.ts` | Audit trail |
| **CertificatePOLink** | `models/CertificatePOLink.ts` | Certificate-PO relationships |
| **SupplierUploadLink** | `models/SupplierUploadLink.ts` | Supplier upload links |

### Key Relationships
- **User** ↔ **Membership** ↔ **Organization** (Many-to-Many)
- **Organization** → **Lot** (One-to-Many)
- **Lot** → **Bid** (One-to-Many)
- **Bid** → **Contract** (One-to-One, when accepted)
- **Lot** → **Certificate** (Many-to-Many via compliance.certificates)

---

## 🛠️ Tech Stack

### Core Framework
- **Next.js:** 14.2.0 (App Router)
- **React:** 18.3.0
- **TypeScript:** 5.4.0

### Frontend Technologies
- **Styling:** Tailwind CSS 3.4.7
- **Icons:** Lucide React 0.400.0
- **Fonts:** Inter (Google Fonts)
- **Date Handling:** date-fns 4.1.0

### Backend Technologies
- **Runtime:** Node.js (via Next.js)
- **API:** Next.js API Routes (RESTful)
- **Database:** MongoDB Atlas (via Mongoose)
- **Authentication:** Clerk 5.0.0
- **Email:** Resend (via `lib/email.ts`)

### File Processing
- **PDF Parsing:** pdf-parse 2.4.5
- **OCR:** tesseract.js 6.0.1
- **File Upload:** formidable 3.5.4

### Development Tools
- **Linting:** ESLint 8.57.0
- **PostCSS:** 8.4.40
- **Autoprefixer:** 10.4.20

---

## 🛣️ Routing Structure

### Next.js App Router Conventions

#### Page Routes (Frontend)
```
/                    → app/page.tsx
/dashboard           → app/dashboard/page.tsx
/certificates         → app/certificates/page.tsx
/certificates/[id]    → app/certificates/[id]/page.tsx
/sign-in             → app/sign-in/[[...sign-in]]/page.tsx
/sign-up             → app/sign-up/[[...sign-up]]/page.tsx
/verify-otp          → app/verify-otp/page.tsx
/onboarding          → app/onboarding/page.tsx
```

#### API Routes (Backend)
```
/api/lots            → app/api/lots/route.ts
/api/lots/[id]       → app/api/lots/[id]/route.ts
/api/bids            → app/api/bids/route.ts
/api/bids/[id]       → app/api/bids/[id]/route.ts
/api/certificates    → app/api/certificates/route.ts
/api/contracts       → app/api/contracts/route.ts
/api/auth/otp/send   → app/api/auth/otp/send/route.ts
/api/webhooks/clerk  → app/api/webhooks/clerk/route.ts
```

### Dynamic Routes
- `[id]` - Dynamic ID parameter (e.g., `/api/lots/[id]`)
- `[[...sign-in]]` - Catch-all optional segments (Clerk auth routes)

---

## 🔐 Middleware & Authentication

### Middleware File
- **Location:** `middleware.ts` (root directory)
- **Framework:** Clerk Middleware (`@clerk/nextjs/server`)

### Middleware Configuration

```typescript
// Public routes (no authentication required)
const isPublicRoute = createRouteMatcher([
  '/',                              // Landing page
  '/sign-in(.*)',                  // Sign in pages
  '/sign-up(.*)',                  // Sign up pages
  '/api/webhooks(.*)',             // Webhook endpoints
  '/api/health(.*)',               // Health checks
  '/api/lots/external(.*)',        // External API
  '/api/lots(.*)',                 // Public lots API (GET)
  '/api/bids(.*)',                 // Bids API (POST from external)
  '/verify-otp(.*)',               // OTP verification
])
```

### Authentication Flow
1. **Clerk Authentication** - Handles sign-in/sign-up
2. **Middleware Protection** - Protects routes except public ones
3. **User Sync** - Clerk webhook syncs users to MongoDB
4. **OTP Verification** - Additional email verification (optional)

### Protected Routes
- `/dashboard` - Requires authentication
- `/certificates` - Requires authentication
- `/api/lots` (POST) - Requires authentication
- `/api/bids` (GET) - Requires authentication
- `/api/contracts` - Requires authentication

---

## 🔌 External Integrations

### Clerk (Authentication)
- **Purpose:** User authentication and management
- **Integration:** `@clerk/nextjs` package
- **Webhook:** `/api/webhooks/clerk` - Syncs user lifecycle events
- **Provider:** Wrapped in `app/layout.tsx` via `ClerkProvider`

### MongoDB Atlas (Database)
- **Purpose:** Primary data storage
- **Connection:** `lib/mongodb.ts` with connection caching
- **Environment:** `MONGODB_URI` in `.env.local`

### Resend (Email)
- **Purpose:** Transactional emails (OTP, notifications)
- **Integration:** `lib/email.ts`
- **Templates:** `lib/email-templates.ts`

### External APIs
- **Buyer Dashboard:** `http://localhost:3000` (sends bids)
- **Producer Dashboard:** Receives webhooks at configured URL

---

## 📦 Key Dependencies

### Production Dependencies
```json
{
  "@clerk/nextjs": "^5.0.0",        // Authentication
  "next": "^14.2.0",                // Framework
  "react": "^18.3.0",               // UI Library
  "mongoose": "via mongo package",  // Database ODM
  "lucide-react": "^0.400.0",       // Icons
  "tailwindcss": "^3.4.7",          // Styling
  "pdf-parse": "^2.4.5",            // PDF processing
  "tesseract.js": "^6.0.1"          // OCR
}
```

### Development Dependencies
```json
{
  "typescript": "^5.4.0",
  "eslint": "^8.57.0",
  "@types/node": "^20.0.0",
  "@types/react": "^18.3.0"
}
```

---

## 🚀 Deployment Configuration

### Build Configuration
- **Config File:** `next.config.js`
- **TypeScript Config:** `tsconfig.json`
- **Tailwind Config:** `tailwind.config.ts`
- **PostCSS Config:** `postcss.config.js`

### Environment Variables (`.env.local`)
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...

# MongoDB
MONGODB_URI=mongodb+srv://...

# Email (Resend)
RESEND_API_KEY=...

# External Integrations
PRODUCER_DASHBOARD_WEBHOOK_URL=...
PRODUCER_DASHBOARD_WEBHOOK_SECRET=...
BUYER_DASHBOARD_URL=http://localhost:3000
PRODUCER_API_KEY=...
```

### Port Configuration
- **Default Port:** 3004
- **Script:** `find-port.ps1` (PowerShell) for port detection
- **Dev Command:** `npm run dev` (auto-detects port)
- **Direct Dev:** `npm run dev:direct` (port 3004)

---

## 📊 Data Flow

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

### Authentication Flow
```
User Signs In (Clerk)
    ↓
Clerk Webhook → /api/webhooks/clerk
    ↓
User Synced to MongoDB
    ↓
User Can Access Protected Routes
```

### Lot Creation Flow
```
User Creates Lot (Frontend)
    ↓
POST /api/lots
    ↓
lib/lots/service.ts → createLot()
    ↓
Save to MongoDB
    ↓
Send Webhook (if configured)
    ↓
Return Created Lot
```

---

## 🔍 Key Features

### Marketplace Features
- ✅ Lot creation, editing, deletion
- ✅ Lot browsing and filtering
- ✅ Bid submission and management
- ✅ Contract generation from accepted bids
- ✅ Price per unit calculation

### Certificate Management
- ✅ PDF upload and parsing
- ✅ OCR data extraction
- ✅ Certificate validation
- ✅ Compliance standards tracking

### Organization Management
- ✅ Multi-tenant organizations
- ✅ Member management
- ✅ Role-based access

### Integration Features
- ✅ Webhook support for external systems
- ✅ External API endpoints
- ✅ Bid submission to Buyer Dashboard
- ✅ Real-time bid updates (polling)

---

## 📝 File Naming Conventions

### Pages
- `page.tsx` - Page component (App Router)
- `layout.tsx` - Layout component
- `route.ts` - API route handler

### Components
- `PascalCase.tsx` - React components
- `kebab-case/` - Component directories

### Services
- `service.ts` - Business logic
- `types.ts` - TypeScript types
- `utils.ts` - Utility functions

### Models
- `PascalCase.ts` - Mongoose models (e.g., `User.ts`, `Lot.ts`)

---

## 🎯 Summary

### Architecture Type
**Full-Stack Next.js Application** with integrated frontend and backend

### Frontend Location
- **Pages:** `app/` directory (App Router)
- **Components:** `components/` directory
- **Styles:** Tailwind CSS + `app/globals.css`

### Backend Location
- **API Routes:** `app/api/` directory
- **Business Logic:** `lib/` directory
- **Database Models:** `models/` directory

### Database
- **Type:** MongoDB (NoSQL)
- **ODM:** Mongoose
- **Connection:** `lib/mongodb.ts`

### Routing
- **Style:** Next.js App Router
- **Pages:** `app/*/page.tsx`
- **API:** `app/api/*/route.ts`

### Middleware
- **File:** `middleware.ts`
- **Framework:** Clerk Middleware
- **Purpose:** Route protection and authentication

---

**End of Analysis**



