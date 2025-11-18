import { clerkClient } from '@clerk/nextjs/server'

export interface OTPData {
  code: string
  expiresAt: number
  attempts: number
  createdAt: number
}

const OTP_EXPIRATION_MINUTES = 10
const MAX_ATTEMPTS = 3
const RATE_LIMIT_SECONDS = 60 // 1 minute between OTP requests

/**
 * Generate a 6-digit numeric OTP code
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Get OTP expiration timestamp (current time + expiration minutes)
 */
export function getOTPExpiration(): number {
  return Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000
}

/**
 * Check if OTP is expired
 */
export function isOTPExpired(expiresAt: number): boolean {
  return Date.now() > expiresAt
}

/**
 * Store OTP in Clerk user metadata
 */
export async function storeOTP(userId: string, otpCode: string): Promise<void> {
  const expiresAt = getOTPExpiration()
  const otpData: OTPData = {
    code: otpCode,
    expiresAt,
    attempts: 0,
    createdAt: Date.now(),
  }

  await clerkClient.users.updateUserMetadata(userId, {
    privateMetadata: {
      otp: otpData,
    },
  })
}

/**
 * Get OTP from Clerk user metadata
 */
export async function getOTP(userId: string): Promise<OTPData | null> {
  const user = await clerkClient.users.getUser(userId)
  const otp = user.privateMetadata?.otp as OTPData | undefined

  if (!otp) {
    return null
  }

  // Clean up expired OTP
  if (isOTPExpired(otp.expiresAt)) {
    await clearOTP(userId)
    return null
  }

  return otp
}

/**
 * Verify OTP code
 */
export async function verifyOTP(userId: string, inputCode: string): Promise<{ valid: boolean; message: string }> {
  const otp = await getOTP(userId)

  if (!otp) {
    return { valid: false, message: 'No active OTP found. Please request a new code.' }
  }

  if (isOTPExpired(otp.expiresAt)) {
    await clearOTP(userId)
    return { valid: false, message: 'OTP has expired. Please request a new code.' }
  }

  if (otp.attempts >= MAX_ATTEMPTS) {
    await clearOTP(userId)
    return { valid: false, message: 'Maximum verification attempts exceeded. Please request a new code.' }
  }

  // Increment attempts
  const updatedOTP: OTPData = {
    ...otp,
    attempts: otp.attempts + 1,
  }

  await clerkClient.users.updateUserMetadata(userId, {
    privateMetadata: {
      otp: updatedOTP,
    },
  })

  if (otp.code !== inputCode) {
    const remainingAttempts = MAX_ATTEMPTS - updatedOTP.attempts
    return {
      valid: false,
      message: `Invalid code. ${remainingAttempts > 0 ? `${remainingAttempts} attempt${remainingAttempts > 1 ? 's' : ''} remaining.` : 'Please request a new code.'}`,
    }
  }

  // Valid OTP - clear it
  await clearOTP(userId)
  return { valid: true, message: 'OTP verified successfully.' }
}

/**
 * Clear OTP from user metadata
 */
export async function clearOTP(userId: string): Promise<void> {
  const user = await clerkClient.users.getUser(userId)
  const { otp, ...restMetadata } = (user.privateMetadata || {}) as { otp?: OTPData; [key: string]: any }

  await clerkClient.users.updateUserMetadata(userId, {
    privateMetadata: restMetadata,
  })
}

/**
 * Check rate limiting for OTP requests
 */
export async function checkRateLimit(userId: string): Promise<{ allowed: boolean; message?: string }> {
  const user = await clerkClient.users.getUser(userId)
  const otp = user.privateMetadata?.otp as OTPData | undefined

  if (!otp) {
    return { allowed: true }
  }

  const timeSinceCreation = Date.now() - otp.createdAt
  const timeRemaining = Math.ceil((RATE_LIMIT_SECONDS * 1000 - timeSinceCreation) / 1000)

  if (timeSinceCreation < RATE_LIMIT_SECONDS * 1000) {
    return {
      allowed: false,
      message: `Please wait ${timeRemaining} second${timeRemaining > 1 ? 's' : ''} before requesting a new code.`,
    }
  }

  return { allowed: true }
}

