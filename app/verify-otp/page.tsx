'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import OTPInput from '@/components/OTPInput'
import { Mail, Loader2, AlertCircle } from 'lucide-react'

export default function VerifyOTPPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoaded } = useUser()
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [isResendDisabled, setIsResendDisabled] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const redirectTo = searchParams.get('redirect') || '/dashboard'

  // Ensure video plays
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const attemptPlay = () => {
      const playPromise = video.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          setTimeout(() => {
            video.play().catch(() => { })
          }, 500)
        })
      }
    }

    attemptPlay()
    video.addEventListener('canplay', attemptPlay, { once: true })
    video.addEventListener('loadeddata', attemptPlay, { once: true })

    return () => {
      video.removeEventListener('canplay', attemptPlay)
      video.removeEventListener('loadeddata', attemptPlay)
    }
  }, [])

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in')
    }
  }, [isLoaded, user, router])

  // Send OTP on mount
  useEffect(() => {
    if (isLoaded && user) {
      sendOTP()
    }
  }, [isLoaded, user])

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      setIsResendDisabled(false)
    }
  }, [resendCooldown])

  const sendOTP = async () => {
    try {
      const response = await fetch('/api/auth/otp/send', {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send OTP')
      }
    } catch (err: any) {
      console.error('Error sending OTP:', err)
      setError(err.message || 'Failed to send OTP. Please try again.')
    }
  }

  const handleVerify = async (code: string) => {
    if (code.length !== 6) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Invalid verification code')
      }

      // Success - redirect
      router.push(redirectTo)
    } catch (err: any) {
      setError(err.message || 'Invalid verification code. Please try again.')
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (isResendDisabled || isResending) return

    setIsResending(true)
    setError('')

    try {
      const response = await fetch('/api/auth/otp/resend', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend OTP')
      }

      // Set cooldown (60 seconds)
      setResendCooldown(60)
      setIsResendDisabled(true)
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const userEmail = user.emailAddresses[0]?.emailAddress || 'your email'

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-gradient-to-br from-white via-blue-50/30 to-lightblue-50/50">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-light text-slate-800 mb-3">
              Verify Your Email
            </h1>
            <p className="text-slate-500 text-sm">
              We&apos;ve sent a 6-digit verification code to
            </p>
            <p className="text-slate-700 font-medium mt-1 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {userEmail}
            </p>
          </div>

          {/* OTP Input */}
          <div className="space-y-6">
            <OTPInput
              length={6}
              onComplete={handleVerify}
              disabled={isLoading}
              error={error}
            />

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Resend Section */}
            <div className="text-center space-y-3">
              <p className="text-sm text-slate-500">
                Didn&apos;t receive the code?
              </p>
              <button
                onClick={handleResend}
                disabled={isResendDisabled || isResending}
                className="text-sm font-medium text-primary-600 hover:text-primary-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
              >
                {isResending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </span>
                ) : isResendDisabled ? (
                  `Resend code in ${resendCooldown}s`
                ) : (
                  'Resend verification code'
                )}
              </button>
            </div>

            {/* Back to Sign In */}
            <div className="pt-4 border-t border-slate-200">
              <p className="text-center text-sm text-slate-500">
                Wrong email?{' '}
                <Link href="/sign-in" className="text-primary-600 hover:text-primary-700 font-medium">
                  Sign in with a different account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Video */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900"></div>

        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover z-0"
          style={{ width: '100%', height: '100%' }}
        >
          <source src="/videos/clouds.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-slate-900/40 z-[1]"></div>

        <div className="relative z-[2] flex items-start justify-center w-full h-full px-12 pt-20">
          <div className="text-center">
            <p className="text-4xl lg:text-5xl xl:text-6xl font-light text-white leading-tight">
              Secure Your Account
            </p>
            <p className="text-4xl lg:text-5xl xl:text-6xl font-light text-white leading-tight mt-2">
              with Two-Factor Authentication
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

