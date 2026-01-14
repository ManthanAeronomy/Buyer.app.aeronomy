'use client'

import { useCallback, useState } from 'react'
import { Loader2, Save, Undo2 } from 'lucide-react'
import { CertificateRecord, CertificateListStatus } from '@/lib/certificates/types'

const STATUS_LABELS: Record<CertificateListStatus, string> = {
  uploaded: 'Pending Review',
  validated: 'Active',
  expiring: 'Expiring Soon',
  expired: 'Expired',
  invalid: 'Invalid',
}

const CERTIFICATE_TYPES = ['ISCC', 'RSB', 'CORSIA', 'other']

interface CertificateEditorProps {
  certificate: CertificateRecord
  onUpdated?(certificate: CertificateRecord): void
}

export default function CertificateEditor({ certificate, onUpdated }: CertificateEditorProps) {
  const [editing, setEditing] = useState({
    type: certificate.type,
    issuingBody: certificate.issuingBody || '',
    issueDate: certificate.issueDate ? certificate.issueDate.substring(0, 10) : '',
    expiryDate: certificate.expiryDate ? certificate.expiryDate.substring(0, 10) : '',
    volumeAmount: certificate.volume?.amount?.toString() || '',
    volumeUnit: certificate.volume?.unit || '',
    status: certificate.status,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const reset = useCallback(() => {
    setEditing({
      type: certificate.type,
      issuingBody: certificate.issuingBody || '',
      issueDate: certificate.issueDate ? certificate.issueDate.substring(0, 10) : '',
      expiryDate: certificate.expiryDate ? certificate.expiryDate.substring(0, 10) : '',
      volumeAmount: certificate.volume?.amount?.toString() || '',
      volumeUnit: certificate.volume?.unit || '',
      status: certificate.status,
    })
    setError(null)
    setSuccess(null)
  }, [certificate])

  const save = useCallback(async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    const payload: Record<string, unknown> = {
      type: editing.type,
      issuingBody: editing.issuingBody || undefined,
      issueDate: editing.issueDate || undefined,
      expiryDate: editing.expiryDate || undefined,
      status: editing.status,
    }

    if (editing.volumeAmount) {
      payload.volume = {
        amount: parseFloat(editing.volumeAmount),
        unit: editing.volumeUnit,
      }
    } else {
      payload.volume = undefined
    }

    try {
      const res = await fetch(`/api/certificates/${certificate._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save certificate')
      }

      const data = await res.json()
      setSuccess('Certificate saved')
      if (onUpdated) {
        onUpdated(data.certificate)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save certificate')
    } finally {
      setIsSaving(false)
    }
  }, [certificate._id, editing, onUpdated])

  return (
    <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-500">Manual Review</p>
          <h3 className="text-xl font-semibold text-slate-900">
            {certificate.file?.originalName || 'Certificate'}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
            onClick={reset}
            disabled={isSaving}
          >
            <Undo2 className="h-4 w-4" />
            Reset
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-60"
            onClick={save}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save changes
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <label className="space-y-2">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Certificate Type</span>
          <select
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            value={editing.type}
            onChange={(event) => setEditing((prev) => ({ ...prev, type: event.target.value }))}
          >
            {CERTIFICATE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.toUpperCase()}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Issuing Body</span>
          <input
            type="text"
            value={editing.issuingBody}
            onChange={(event) => setEditing((prev) => ({ ...prev, issuingBody: event.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            placeholder="e.g. International Sustainability & Carbon Certification"
          />
        </label>

        <label className="space-y-2">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</span>
          <select
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            value={editing.status}
            onChange={(event) => setEditing((prev) => ({ ...prev, status: event.target.value as CertificateListStatus }))}
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Issue Date</span>
          <input
            type="date"
            value={editing.issueDate}
            onChange={(event) => setEditing((prev) => ({ ...prev, issueDate: event.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </label>

        <label className="space-y-2">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Expiry Date</span>
          <input
            type="date"
            value={editing.expiryDate}
            onChange={(event) => setEditing((prev) => ({ ...prev, expiryDate: event.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Volume</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={editing.volumeAmount}
              onChange={(event) => setEditing((prev) => ({ ...prev, volumeAmount: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              placeholder="e.g. 1500"
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Unit</span>
            <input
              type="text"
              value={editing.volumeUnit}
              onChange={(event) => setEditing((prev) => ({ ...prev, volumeUnit: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              placeholder="e.g. tonnes"
            />
          </label>
        </div>
      </div>

      {success && <p className="rounded-xl bg-green-50 px-4 py-2 text-sm text-green-700">{success}</p>}
      {error && <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}



















