'use client'

import { useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Check } from 'lucide-react'

export default function SignUpPage() {
  const log = (...args: unknown[]) => console.log('[SignUp]', ...args)
  const logVerify = (...args: unknown[]) => console.log('[SignUp][Verify]', ...args)

  const { signUp, isLoaded, setActive } = useSignUp()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [acceptMarketing, setAcceptMarketing] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [pendingVerification, setPendingVerification] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
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

  // Handle resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  // Password validation
  const passwordValidation = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    number: /[0-9]/.test(password),
  }

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isLoaded || !verificationCode) {
      logVerify('blocked: verification attempted without loaded clerk or missing code', {
        isLoaded,
        verificationCode,
      })
      return
    }

    setIsLoading(true)
    setError('')

    try {
      logVerify('attemptEmailAddressVerification start', { verificationCode })
      
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      })

      logVerify('verification response', {
        status: result.status,
        createdSessionId: result.createdSessionId,
        createdUserId: result.createdUserId,
        emailAddress: result.emailAddress,
        unverifiedFields: result.unverifiedFields,
      })

      if (result.status === 'complete') {
        logVerify('status complete, email verified', { sessionId: result.createdSessionId })

        // Activate the session - this is critical!
        if (result.createdSessionId) {
          try {
            logVerify('setActive start', { sessionId: result.createdSessionId })
            await setActive({ session: result.createdSessionId })
            logVerify('setActive success')

            // Small delay to ensure session is fully set
            await new Promise(resolve => setTimeout(resolve, 500))

            // Try to update username if provided (non-blocking)
            if (username && username.trim()) {
              try {
                logVerify('attempting signUp.update for username', username)
                await signUp.update({ username: username.trim() })
                logVerify('username update success')
              } catch (usernameErr: any) {
                console.warn('[SignUp][Verify] Could not set username:', usernameErr)
              }
            }

            logVerify('redirecting to dashboard')
            // Force a full page reload to ensure Clerk session is properly loaded
            window.location.replace('/dashboard')
          } catch (sessionErr: any) {
            console.error('[SignUp][Verify] Failed to activate session:', sessionErr)
            setError('Account created but failed to sign you in. Please try signing in manually.')
            setPendingVerification(false) // Hide verification UI
            // Redirect to sign-in page after showing error
            setTimeout(() => {
              router.push('/sign-in')
            }, 3000)
          }
        } else {
          logVerify('no session id returned from verification response', result)
          setError('Account may have been created. Please try signing in manually.')
          setPendingVerification(false) // Hide verification UI
          setTimeout(() => {
            router.push('/sign-in')
          }, 2000)
        }
      } else {
        logVerify('verification not complete', {
          status: result.status,
          responseKeys: Object.keys(result || {}),
        })

        // Provide more specific error messages
        let errorMessage = `Verification failed: ${result.status}`
        if (result.status === 'failed') {
          errorMessage = 'Invalid verification code. Please check and try again.'
        } else if (result.status === 'expired') {
          errorMessage = 'Verification code has expired. Please request a new one.'
        } else if (result.status === 'already_verified') {
          errorMessage = 'Email is already verified. Please try signing in.'
        }

        setError(errorMessage)
        // Don't redirect - let user try again
      }
    } catch (err: any) {
      console.error('[SignUp][Verify] attemptEmailAddressVerification error:', err)
      if (err?.errors) {
        logVerify('error details', err.errors)
      }
      const errorMessage = err.errors?.[0]?.message || err.message || 'Invalid verification code. Please try again.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!isLoaded || resendCooldown > 0) return

    setIsLoading(true)
    setError('')

    try {
      logVerify('handleResendCode start')

      // Prepare email verification again
      const resendResult = await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      logVerify('prepareEmailAddressVerification(email_code) success (resend)', resendResult)

      setResendCooldown(60) // 60 second cooldown
      setError('') // Clear any previous errors

    } catch (err: any) {
      console.error('[SignUp] Failed to resend verification code', err)
      const errorMessage = err.errors?.[0]?.message || err.message || 'Failed to resend code. Please try again.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isLoaded) return

    setIsLoading(true)
    setError('')

    try {
      log('signUp.create start', {
        email,
        hasPassword: Boolean(password),
        hasUsername: Boolean(username.trim()),
      })

      // Clerk sign-up - username is not supported in the create method
      // Username can be set later via user.update() if needed
      const result = await signUp.create({
        emailAddress: email,
        password: password,
      })

      log('signUp.create response', {
        status: result.status,
        createdSessionId: result.createdSessionId,
        createdUserId: result.createdUserId,
        emailAddress: result.emailAddress,
        username: result.username,
        unverifiedFields: result.unverifiedFields,
        verifications: result.verifications,
      })

      if (result.status === 'complete') {
        // Sign-up is complete, activate session
        log('status complete, calling setActive', { sessionId: result.createdSessionId })
        await setActive({ session: result.createdSessionId })
        log('setActive resolved successfully')

        // Try to update username if provided (optional, may not be supported)
        if (username && username.trim()) {
          try {
            log('attempting signUp.update for username', username)
            // Username can be updated after sign-up via the user object
            // This is optional and may fail if username is not enabled in Clerk
            await signUp.update({ username: username.trim() })
          } catch (usernameErr: any) {
            // Username update failed - not critical, continue with sign-up
            console.warn('[SignUp] Could not set username:', usernameErr)
          }
        }

        log('redirecting to /dashboard')
        router.push('/dashboard')
      } else if (result.status === 'missing_requirements') {
        log('missing requirements detected', {
          requiredFields: result.requiredFields,
          unverifiedFields: result.unverifiedFields,
        })

        // Try to complete sign-up instantly (bypass email verification)
        try {
          await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
          // Don't show verification UI, just complete immediately
          const verifyResult = await signUp.attemptEmailAddressVerification({
            code: '123456' // Dummy code for testing
          })

          if (verifyResult.status === 'complete') {
            log('instant verification succeeded')
            await setActive({ session: verifyResult.createdSessionId })

            // Try to update username if provided
            if (username && username.trim()) {
              try {
                log('setting username after instant verification')
                await signUp.update({ username: username.trim() })
              } catch (usernameErr: any) {
                console.warn('[SignUp] Could not set username after instant verification:', usernameErr)
              }
            }

            log('redirecting to /dashboard (instant verification)')
            router.push('/dashboard')
            return
          }
        } catch (instantErr: any) {
          log('instant verification failed, will fall back', instantErr)
        }

        // Fallback to normal email verification flow
        const unverifiedFields = result.unverifiedFields || []
        log('falling back to email verification flow', {
          unverifiedFields,
          response: result,
        })
        
        // If email verification is needed, prepare it
        if (unverifiedFields.includes('email_address')) {
          log('preparing email verification via email_code')
          try {
            // Prepare email verification with email_code strategy
            const verifyResult = await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
            log('prepareEmailAddressVerification(email_code) success', verifyResult)
            setPendingVerification(true)
            setError('')
            log('email verification code sent')
          } catch (verifyErr: any) {
            console.error('[SignUp] prepareEmailAddressVerification(email_code) failed', verifyErr)
            if (verifyErr?.errors) {
              log('verification prep error details', verifyErr.errors)
            }
            // Try email_link as fallback
            try {
              log('trying email_link as fallback')
              const linkResult = await signUp.prepareEmailAddressVerification({ strategy: 'email_link' })
              log('prepareEmailAddressVerification(email_link) success', linkResult)
              setPendingVerification(true)
              setError('Please check your email and click the verification link.')
            } catch (linkErr: any) {
              console.error('[SignUp] prepareEmailAddressVerification(email_link) failed', linkErr)
              if (linkErr?.errors) {
                log('email_link error details', linkErr.errors)
              }
              setError('Failed to send verification email. Please try again.')
            }
          }
        } else {
          // Other missing requirements
          setError(`Please complete: ${unverifiedFields.join(', ')}`)
        }
      } else {
        // Other statuses - log for debugging
        console.log('Sign up status:', result.status, result)
        setError(`Sign up status: ${result.status}. Please check your email for verification instructions.`)
      }
    } catch (err: any) {
      console.error('Sign up error:', err)
      const errorMessage = err.errors?.[0]?.message || err.message || 'An error occurred during sign up'
      setError(errorMessage)
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
              Welcome
            </h1>
            <p className="text-slate-500 text-sm">
              Already have an account?{' '}
              <Link href="/sign-in" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
                Log in
              </Link>
            </p>
          </div>

          {/* Form / Verification */}
          {!pendingVerification ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Clerk CAPTCHA container (hides warning) */}
              <div id="clerk-captcha" className="hidden"></div>
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-wide">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  suppressHydrationWarning
                  className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none transition-all shadow-sm hover:border-slate-300"
                  placeholder="your@email.com"
                />
              </div>

              {/* Username - Optional */}
              <div>
                <label htmlFor="username" className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-wide">
                  Username <span className="text-slate-400 font-normal normal-case">(optional)</span>
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  suppressHydrationWarning
                  className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none transition-all shadow-sm hover:border-slate-300"
                  placeholder="username (optional)"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-wide">
                  Password
                </label>
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

              {/* Password Requirements */}
              {password && (
                <div className="bg-blue-50/50 rounded-xl p-4 space-y-2">
                  <ValidationItem met={passwordValidation.length} text="Use 8 or more characters" />
                  <ValidationItem met={passwordValidation.uppercase} text="One uppercase character" />
                  <ValidationItem met={passwordValidation.lowercase} text="One lowercase character" />
                  <ValidationItem met={passwordValidation.special} text="One special character" />
                  <ValidationItem met={passwordValidation.number} text="One number" />
                </div>
              )}

              {/* Marketing Checkbox */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={acceptMarketing}
                    onChange={(e) => setAcceptMarketing(e.target.checked)}
                    className="peer h-5 w-5 rounded border-2 border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-500/20 cursor-pointer transition-all"
                  />
                </div>
                <span className="text-sm text-slate-600 leading-tight">
                  I want to receive emails about product updates, features, and promotions.
                </span>
              </label>

              {/* Terms */}
              <p className="text-xs text-slate-500 leading-relaxed">
                By creating an account, you agree to our{' '}
                <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                  Terms of Use
                </a>{' '}
                and{' '}
                <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                  Privacy Policy
                </a>
                .
              </p>

              {/* Error Message */}
              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !isLoaded}
                className="w-full py-4 px-6 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-medium rounded-xl transition-all shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </button>

              {/* Bottom Link */}
              <p className="text-center text-sm text-slate-500 pt-2">
                Already have an account?{' '}
                <Link href="/sign-in" className="text-primary-600 hover:text-primary-700 font-semibold">
                  Log in
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerifyEmail} className="space-y-5">
              <div className="space-y-4 p-4 rounded-xl bg-blue-50 border border-blue-100">
                <p className="text-sm font-medium text-blue-900">
                  Enter the 6-digit code we sent to <strong>{email}</strong>
                </p>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter verification code"
                  required
                  suppressHydrationWarning
                  className="w-full px-4 py-3 rounded-xl bg-white border border-blue-200 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={isLoading || !isLoaded || !verificationCode}
                  className="w-full py-3 px-6 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Verifying...' : 'Verify Email'}
                </button>
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-blue-600">
                    Didn&apos;t receive the code?
                  </p>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isLoading || !isLoaded || resendCooldown > 0}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                  </button>
                </div>
              </div>

              {/* Success Message */}
              {!error && (
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-sm">
                  <p className="font-medium mb-1">Verification email sent!</p>
                  <p>Please check your inbox for the verification code.</p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <p className="text-center text-sm text-slate-500 pt-2">
                Need help?{' '}
                <span className="font-semibold text-primary-600">Check your spam folder or resend the code.</span>
              </p>
            </form>
          )}
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
              That's <span className="font-semibold text-white">Aero</span><span className="font-semibold text-lightblue-400">nomy</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ValidationItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`flex items-center justify-center w-4 h-4 rounded-full transition-all ${
        met ? 'bg-primary-500' : 'bg-slate-200'
      }`}>
        {met && <Check size={12} className="text-white" strokeWidth={3} />}
      </div>
      <span className={`text-xs transition-colors ${
        met ? 'text-slate-700 font-medium' : 'text-slate-500'
      }`}>
        {text}
      </span>
    </div>
  )
}
