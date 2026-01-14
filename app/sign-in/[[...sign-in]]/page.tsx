'use client'

import { useAuth, useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'

export default function SignInPage() {
  const { signIn, isLoaded, setActive } = useSignIn()
  const { isLoaded: authLoaded, isSignedIn } = useAuth()
  const router = useRouter()
  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Ensure video plays - multiple attempts
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const attemptPlay = () => {
      const playPromise = video.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Video playing successfully')
          })
          .catch((error) => {
            console.log('Video autoplay failed:', error)
            // Try again after a short delay
            setTimeout(() => {
              video.play().catch(() => {
                console.log('Second play attempt failed')
              })
            }, 500)
          })
      }
    }

    // Try immediately
    attemptPlay()

    // Also try when video can play
    video.addEventListener('canplay', attemptPlay, { once: true })
    video.addEventListener('loadeddata', attemptPlay, { once: true })

    return () => {
      video.removeEventListener('canplay', attemptPlay)
      video.removeEventListener('loadeddata', attemptPlay)
    }
  }, [])

  // If user already has an active session, skip the sign-in form entirely
  useEffect(() => {
    if (authLoaded) {
      if (isSignedIn) {
        console.log('[SignIn] Session already exists, redirecting to dashboard')
        router.replace('/dashboard')
      }
    }
  }, [authLoaded, isSignedIn, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isLoaded) return

    setIsLoading(true)
    setError('')

    try {
      const result = await signIn.create({
        identifier: emailOrUsername,
        password: password,
      })

      console.log('Sign in result:', result.status)

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        console.log('✅ Sign in successful! Redirecting to dashboard...')

        // Redirect directly to dashboard (skip OTP for now)
        router.push('/dashboard')
      } else {
        console.log('Sign in status:', result.status)
      }
    } catch (err: any) {
      if (err?.errors?.[0]?.code === 'session_exists') {
        console.log('[SignIn] session_exists error received, redirecting to dashboard')
        router.replace('/dashboard')
        return
      }
      console.error('Sign in error:', err)
      console.log('Error details:', err.errors)

      const errorMessage = err.errors?.[0]?.message || 'Invalid email/username or password'

      // Check if account doesn't exist
      if (errorMessage.includes('account') || errorMessage.includes('Couldn\'t find')) {
        setError('No account found with these credentials. Please sign up first.')
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-gradient-to-br from-white via-blue-50/30 to-lightblue-50/50">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-light text-slate-800 mb-3">
              Welcome Back
            </h1>
            <p className="text-slate-500 text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/sign-up" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
                Sign up
              </Link>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email or Username */}
            <div>
              <label htmlFor="identifier" className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-wide">
                Email or Username
              </label>
              <input
                id="identifier"
                type="text"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                required
                suppressHydrationWarning
                className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none transition-all shadow-sm hover:border-slate-300"
                placeholder="your@email.com"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-xs font-medium text-slate-600 uppercase tracking-wide">
                  Password
                </label>
                <a href="#" className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  suppressHydrationWarning
                  className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none transition-all shadow-sm hover:border-slate-300 pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !isLoaded}
              className="w-full py-4 px-6 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-medium rounded-xl transition-all shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>

            {/* Bottom Link */}
            <p className="text-center text-sm text-slate-500 pt-4">
              Don&apos;t have an account?{' '}
              <Link href="/sign-up" className="text-primary-600 hover:text-primary-700 font-semibold">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right Side - Video */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 min-h-screen">
        {/* Fallback background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900"></div>

        {/* Video Background */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover z-0"
          style={{ width: '100%', height: '100%' }}
          onLoadedMetadata={(e) => {
            const video = e.currentTarget
            console.log('Video metadata loaded')
            video.playbackRate = 0.5
            video.play().catch((err) => {
              console.log('Video play on metadata failed:', err)
            })
          }}
          onLoadedData={(e) => {
            const video = e.currentTarget
            console.log('Video data loaded')
            video.play().catch((err) => {
              console.log('Video play on data loaded failed:', err)
            })
          }}
          onCanPlay={(e) => {
            const video = e.currentTarget
            console.log('Video can play')
            video.play().catch((err) => {
              console.log('Video play on canPlay failed:', err)
            })
          }}
          onCanPlayThrough={(e) => {
            const video = e.currentTarget
            console.log('Video can play through')
            video.play().catch((err) => {
              console.log('Video play on canPlayThrough failed:', err)
            })
          }}
          onError={(e) => {
            const video = e.currentTarget
            console.error('Video error:', video.error)
            if (video.error) {
              console.error('Error code:', video.error.code)
              console.error('Error message:', video.error.message)
            }
          }}
          onPlay={() => {
            console.log('Video is playing!')
          }}
          onPause={() => {
            console.log('Video paused')
          }}
        >
          <source src="/videos/clouds.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-slate-900/40 z-[1]"></div>

        {/* Text Overlay */}
        <div className="relative z-[2] flex items-start justify-center w-full h-full px-12 pt-20">
          <div className="text-center">
            <p className="text-4xl lg:text-5xl xl:text-6xl font-light text-white leading-tight">
              One Platform for all your
            </p>
            <p className="text-4xl lg:text-5xl xl:text-6xl font-light text-white leading-tight mt-2">
              SAF needs.
            </p>
            <p className="text-4xl lg:text-5xl xl:text-6xl font-light text-white leading-tight mt-8">
              That&apos;s <span className="font-semibold text-white">Aero</span><span className="font-semibold text-lightblue-400">nomy</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
