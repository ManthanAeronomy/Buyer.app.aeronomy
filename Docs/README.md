# Aeronomy Landing Page

A modern, professional landing page for the Aeronomy SAF (Sustainable Aviation Fuel) marketplace platform.

## Overview

Aeronomy is a compliance-grade marketplace for sustainable aviation fuel trading, built for producers, buyers, and auditors. This landing page showcases the platform's key features including:

- **Identity Proofing**: Org-level verification with corporate email domains and legal entity checks
- **Role-Based Access**: Least-privilege roles with segregation of duties
- **Document Integrity**: SHA-256 hashing, version control, and audit trails
- **Compliance Pre-Check**: Automated validation against UK RTFO, EU RED II, and CORSIA
- **Enterprise Security**: JWT authentication, MFA, and SOC2-ready practices

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Deployment**: Ready for Vercel, Railway, or any Node.js host

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. **Add your authentication background video:**

Place your video in `public/videos/clouds.mp4` (recommended: 1920x1080, 10-30 seconds, MP4 format)

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory and add your Clerk credentials:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your actual Clerk keys from [https://dashboard.clerk.com](https://dashboard.clerk.com)

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3004](http://localhost:3004) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout with metadata
│   └── page.tsx             # Landing page composition
├── components/
│   ├── Header.tsx           # Navigation header with mobile menu
│   ├── Hero.tsx             # Hero section with CTA
│   ├── Features.tsx         # Key features grid
│   ├── HowItWorks.tsx       # 6-step onboarding flow
│   ├── Compliance.tsx       # Regulatory standards section
│   ├── CTA.tsx              # Call-to-action section
│   └── Footer.tsx           # Footer with links
├── public/                  # Static assets
├── tailwind.config.ts       # Tailwind configuration
└── tsconfig.json            # TypeScript configuration
```

## Features

### Responsive Design
- Mobile-first approach
- Hamburger menu for mobile
- Fluid typography and spacing

### Dark Mode Support
- Automatic dark mode based on system preferences
- Beautiful color transitions

### Performance
- Static generation for fast loading
- Optimized images and fonts
- Minimal JavaScript bundle

### Accessibility
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader friendly

## Customization

### Colors

Edit the primary color palette in `tailwind.config.ts`:

```typescript
colors: {
  primary: {
    // Your custom colors
  }
}
```

### Content

Update the content in each component file under `/components/` to match your specific messaging and features.

### Sections

Add or remove sections by editing `app/page.tsx`:

```typescript
export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      {/* Add your custom sections here */}
      <Footer />
    </main>
  )
}
```

## Next Steps

This landing page is designed to integrate with:

1. **Authentication**: Connect to Clerk for signup/signin
2. **Onboarding Flow**: Build the multi-step onboarding application
3. **Backend Services**: Connect to your microservices (svc-identity-org, svc-onboarding, etc.)
4. **Analytics**: Add tracking for conversion optimization

## Architecture Integration

This landing page is the entry point to the larger Aeronomy microservices platform:

- **Gateway**: API gateway with JWT validation
- **svc-identity-org**: Organization and user management
- **svc-onboarding**: State-machine driven onboarding
- **svc-file**: Document storage and integrity
- **svc-compliance-precheck**: Regulatory validation
- **svc-auditlog**: Immutable audit trails

## License

Copyright © 2025 Aeronomy. All rights reserved.

## Support

For questions or support, contact: hello@aeronomy.app

