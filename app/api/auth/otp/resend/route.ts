import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { generateOTP, storeOTP, checkRateLimit, clearOTP } from '@/lib/otp'
import { sendEmail } from '@/lib/email'
import { renderOTPEmail } from '@/lib/email-templates'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user email
    const user = await clerkClient.users.getUser(userId)
    const emailAddress = user.emailAddresses[0]?.emailAddress

    if (!emailAddress) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 })
    }

    // Check rate limiting
    const rateLimitCheck = await checkRateLimit(userId)
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { error: rateLimitCheck.message || 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // Clear old OTP
    await clearOTP(userId)

    // Generate and store new OTP
    const otpCode = generateOTP()
    await storeOTP(userId, otpCode)

    // Render email template
    const emailHtml = renderOTPEmail({
      otpCode,
      userName: user.firstName || undefined,
      expirationMinutes: 10,
    })

    // Send email
    await sendEmail({
      to: emailAddress,
      subject: 'Your Aeronomy Verification Code',
      html: emailHtml,
    })

    return NextResponse.json({
      success: true,
      message: 'New OTP sent successfully',
    })
  } catch (error: any) {
    console.error('Error resending OTP:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to resend OTP' },
      { status: 500 }
    )
  }
}

