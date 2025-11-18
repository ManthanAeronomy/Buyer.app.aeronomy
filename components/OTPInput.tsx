'use client'

import { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from 'react'

interface OTPInputProps {
  length?: number
  onComplete: (otp: string) => void
  disabled?: boolean
  error?: string
}

export default function OTPInput({ length = 6, onComplete, disabled = false, error }: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (index: number, value: string) => {
    if (disabled) return

    // Only allow numbers
    if (value && !/^\d$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    // Check if all inputs are filled
    if (newOtp.every((digit) => digit !== '') && newOtp.join('').length === length) {
      onComplete(newOtp.join(''))
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return

    // Handle backspace
    if (e.key === 'Backspace') {
      if (otp[index] === '' && index > 0) {
        // Move to previous input and clear it
        inputRefs.current[index - 1]?.focus()
        const newOtp = [...otp]
        newOtp[index - 1] = ''
        setOtp(newOtp)
      } else {
        // Clear current input
        const newOtp = [...otp]
        newOtp[index] = ''
        setOtp(newOtp)
      }
    }

    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    if (disabled) return

    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim()
    const digits = pastedData.replace(/\D/g, '').slice(0, length).split('')

    if (digits.length === length) {
      const newOtp = [...otp]
      digits.forEach((digit, index) => {
        newOtp[index] = digit
      })
      setOtp(newOtp)
      onComplete(digits.join(''))
      inputRefs.current[length - 1]?.focus()
    }
  }

  const reset = () => {
    setOtp(Array(length).fill(''))
    inputRefs.current[0]?.focus()
  }

  // Expose reset method via ref if needed
  useEffect(() => {
    if (error) {
      reset()
    }
  }, [error])

  return (
    <div className="w-full">
      <div className="flex items-center justify-center gap-3">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(index, e.target.value)}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled}
            suppressHydrationWarning
            className={`
              w-14 h-14 text-center text-2xl font-semibold
              rounded-xl border-2 transition-all
              focus:outline-none focus:ring-2 focus:ring-primary-500/20
              disabled:opacity-50 disabled:cursor-not-allowed
              ${
                error
                  ? 'border-red-300 bg-red-50 text-red-600'
                  : digit
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
              }
            `}
          />
        ))}
      </div>
    </div>
  )
}

