'use client'

import { useState, Component, ReactNode } from 'react'
import { Menu, X, Plane } from 'lucide-react'
import Link from 'next/link'

// Check if Clerk is configured
const isClerkConfigured = () => {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  return publishableKey && 
         !publishableKey.includes('your_publishable_key') && 
         publishableKey.startsWith('pk_')
}

// Error boundary component to catch Clerk hook errors
class ClerkErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

// Component that uses Clerk hooks (wrapped in error boundary)
function ClerkAuthButtonsInner({ mobile = false }: { mobile?: boolean }) {
  try {
    // Import Clerk hooks (safe now that ClerkProvider is always present)
  const { useAuth, useUser, UserButton } = require('@clerk/nextjs')
  const { isSignedIn } = useAuth()
  const { user } = useUser()
  
  if (isSignedIn) {
    return (
      <>
        <Link
          href="/dashboard"
          className={mobile 
            ? "block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-slate-900 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            : "text-sm font-semibold leading-6 text-slate-900 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400"
          }
          onClick={mobile ? () => {} : undefined}
        >
          Dashboard
        </Link>
        {mobile ? (
          <div className="px-3 py-2">
            <UserButton afterSignOutUrl="/" />
          </div>
        ) : (
          <UserButton 
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-10 w-10"
              }
            }}
          />
        )}
      </>
    )
  }
  
  return (
    <>
      <Link
        href="/sign-in"
        className={mobile
          ? "block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-slate-900 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          : "text-sm font-semibold leading-6 text-slate-900 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400"
        }
        onClick={mobile ? () => {} : undefined}
      >
        Sign in
      </Link>
      <Link
        href="/sign-up"
        className={mobile
          ? "block rounded-lg bg-primary-600 px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-primary-700"
          : "rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
        }
        onClick={mobile ? () => {} : undefined}
      >
        Get Started
      </Link>
    </>
  )
  } catch (error) {
    // Clerk hooks failed, show fallback
    return <FallbackAuthButtons mobile={mobile} />
  }
}

// Wrapper that uses error boundary
function ClerkAuthButtons({ mobile = false }: { mobile?: boolean }) {
  return (
    <ClerkErrorBoundary fallback={<FallbackAuthButtons mobile={mobile} />}>
      <ClerkAuthButtonsInner mobile={mobile} />
    </ClerkErrorBoundary>
  )
}

// Fallback buttons when Clerk is not configured
function FallbackAuthButtons({ mobile = false }: { mobile?: boolean }) {
  return (
    <>
      <Link
        href="/sign-in"
        className={mobile
          ? "block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-slate-900 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          : "text-sm font-semibold leading-6 text-slate-900 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400"
        }
        onClick={mobile ? () => {} : undefined}
      >
        Sign in
      </Link>
      <Link
        href="/sign-up"
        className={mobile
          ? "block rounded-lg bg-primary-600 px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-primary-700"
          : "rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
        }
        onClick={mobile ? () => {} : undefined}
      >
        Get Started
      </Link>
    </>
  )
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const clerkConfigured = isClerkConfigured()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <nav className="mx-auto max-w-7xl px-6 lg:px-8" aria-label="Global">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex lg:flex-1">
            <Link href="/" className="flex items-center space-x-2 -m-1.5 p-1.5">
              <Plane className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold">
                <span className="text-slate-900 dark:text-white">Aero</span>
                <span className="text-primary-600">nomy</span>
              </span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-slate-700 dark:text-slate-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Toggle menu</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden lg:flex lg:gap-x-8">
            <a href="#features" className="text-sm font-semibold leading-6 text-slate-900 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-semibold leading-6 text-slate-900 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400">
              How It Works
            </a>
            <a href="#compliance" className="text-sm font-semibold leading-6 text-slate-900 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400">
              Compliance
            </a>
            <a href="#contact" className="text-sm font-semibold leading-6 text-slate-900 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400">
              Contact
            </a>
          </div>

          {/* CTA buttons */}
          <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4 items-center">
            {clerkConfigured ? (
              <ClerkAuthButtons />
            ) : (
              <FallbackAuthButtons />
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-4">
            <div className="space-y-2 py-4">
              <a
                href="#features"
                className="block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-slate-900 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-slate-900 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </a>
              <a
                href="#compliance"
                className="block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-slate-900 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Compliance
              </a>
              <a
                href="#contact"
                className="block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-slate-900 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </a>
              <div className="pt-4 space-y-2" onClick={() => setMobileMenuOpen(false)}>
                {clerkConfigured ? (
                  <ClerkAuthButtons mobile />
                ) : (
                  <FallbackAuthButtons mobile />
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

