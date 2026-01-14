import React from 'react'

interface OTPEmailProps {
  otpCode: string
  userName?: string
  expirationMinutes: number
}

export default function OTPEmail({ otpCode, userName, expirationMinutes }: OTPEmailProps) {
  return (
    <div style={{ color: '#0f172a' }}>
      {/* Greeting */}
      <h2 style={{ margin: '0 0 16px', fontSize: '24px', fontWeight: 600, color: '#0f172a' }}>
        {userName ? `Hello ${userName},` : 'Hello,'}
      </h2>

      <p style={{ margin: '0 0 24px', fontSize: '16px', lineHeight: '1.6', color: '#475569' }}>
        You&apos;re one step away from accessing your Aeronomy account. Use the verification code below to complete your authentication:
      </p>

      {/* OTP Code Box */}
      <div
        style={{
          margin: '32px 0',
          padding: '24px',
          backgroundColor: '#f1f5f9',
          borderRadius: '8px',
          border: '2px dashed #cbd5e1',
          textAlign: 'center',
        }}
      >
        <p style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 500, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Your Verification Code
        </p>
        <div
          style={{
            display: 'inline-block',
            padding: '16px 32px',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '2px solid #0ea5e9',
            margin: '8px 0',
          }}
        >
          <span
            style={{
              fontSize: '32px',
              fontWeight: 700,
              letterSpacing: '8px',
              color: '#0ea5e9',
              fontFamily: 'monospace',
            }}
          >
            {otpCode}
          </span>
        </div>
        <p style={{ margin: '16px 0 0', fontSize: '12px', color: '#94a3b8' }}>
          This code expires in {expirationMinutes} minutes
        </p>
      </div>

      {/* Security Notice */}
      <div
        style={{
          margin: '32px 0',
          padding: '16px',
          backgroundColor: '#fef3c7',
          borderRadius: '8px',
          borderLeft: '4px solid #f59e0b',
        }}
      >
        <p style={{ margin: 0, fontSize: '14px', color: '#92400e', lineHeight: '1.6' }}>
          <strong style={{ display: 'block', marginBottom: '4px' }}>Security Notice:</strong>
          Never share this code with anyone. Aeronomy staff will never ask for your verification code.
        </p>
      </div>

      {/* Instructions */}
      <p style={{ margin: '24px 0 0', fontSize: '14px', lineHeight: '1.6', color: '#64748b' }}>
        If you didn&apos;t request this verification code, please ignore this email or contact our support team if you have concerns.
      </p>
    </div>
  )
}

