'use client'

import { useState } from 'react'
import { Building2, CheckCircle2, Loader2 } from 'lucide-react'

export default function SetupTestOrgButton() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSetup = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/test/setup-org', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to setup organization')
      }

      setSuccess(true)
      // Reload the page after a short delay to refresh the organization status
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Failed to setup organization')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-2 text-sm text-green-700">
        <CheckCircle2 className="h-4 w-4" />
        <span>Organization setup complete! Refreshing...</span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleSetup}
        disabled={loading}
        className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Setting up...</span>
          </>
        ) : (
          <>
            <Building2 className="h-4 w-4" />
            <span>Setup Test Organization</span>
          </>
        )}
      </button>
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
      <p className="text-xs text-slate-500">
        Create a test organization and assign yourself as admin to post lots
      </p>
    </div>
  )
}




