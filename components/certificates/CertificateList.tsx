'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Filter, Loader2, RefreshCcw } from 'lucide-react'
import { CertificateRecord, CertificateListStatus } from '@/lib/certificates/types'

const STATUS_FILTERS: { value: CertificateListStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'validated', label: 'Active' },
  { value: 'expiring', label: 'Expiring soon' },
  { value: 'expired', label: 'Expired' },
  { value: 'uploaded', label: 'Pending review' },
  { value: 'invalid', label: 'Invalid' },
]

const TYPE_FILTERS = [
  { value: 'all', label: 'All types' },
  { value: 'ISCC', label: 'ISCC' },
  { value: 'RSB', label: 'RSB' },
  { value: 'CORSIA', label: 'CORSIA' },
  { value: 'other', label: 'Other' },
]

export interface CertificateListProps {
  onSelect?(certificate: CertificateRecord): void
  refreshSignal?: number
}

export default function CertificateList({ onSelect, refreshSignal }: CertificateListProps) {
  const [statusFilter, setStatusFilter] = useState<CertificateListStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'ISCC' | 'RSB' | 'CORSIA' | 'other'>('all')
  const [issuingBodyFilter, setIssuingBodyFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [certificates, setCertificates] = useState<CertificateRecord[]>([])

  const fetchCertificates = useCallback(async () => {
    setLoading(true)
    setError(null)

    const params = new URLSearchParams()
    if (statusFilter !== 'all') params.append('status', statusFilter)
    if (typeFilter !== 'all') params.append('type', typeFilter)
    if (issuingBodyFilter) params.append('issuingBody', issuingBodyFilter)

    try {
      const res = await fetch(`/api/certificates?${params.toString()}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Unable to load certificates')
      }
      const data = await res.json()
      setCertificates(data.certificates || [])
    } catch (err: any) {
      setError(err.message || 'Unable to load certificates')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, typeFilter, issuingBodyFilter])

  useEffect(() => {
    fetchCertificates()
  }, [fetchCertificates, refreshSignal])

  const groups = useMemo(() => {
    const result: Record<string, CertificateRecord[]> = {}
    certificates.forEach((certificate) => {
      const status = certificate.status || 'uploaded'
      if (!result[status]) {
        result[status] = []
      }
      result[status].push(certificate)
    })
    return result
  }, [certificates])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <Filter className="h-4 w-4 text-slate-400" />
          Configure filters to narrow the certificate list.
        </div>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as CertificateListStatus | 'all')}
          >
            {STATUS_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as typeof typeFilter)}
          >
            {TYPE_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <input
            type="text"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            placeholder="Issuing body"
            value={issuingBodyFilter}
            onChange={(event) => setIssuingBodyFilter(event.target.value)}
          />
        </div>

        <button
          type="button"
          onClick={fetchCertificates}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white p-12 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="ml-3 text-sm">Loading certificates…</span>
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
          {error}
        </div>
      ) : certificates.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-500">
          Upload certificates to populate this workspace. Filters and status flags will appear once data is available.
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groups).map(([status, items]) => (
            <div key={status} className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                {STATUS_FILTERS.find((option) => option.value === status)?.label || status}
              </h3>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map((certificate) => (
                  <button
                    key={certificate._id}
                    type="button"
                    onClick={() => onSelect && onSelect(certificate)}
                    className="rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {certificate.file?.originalName || 'Certificate'}
                        </p>
                        <p className="text-xs text-slate-400">{certificate.type?.toUpperCase()}</p>
                      </div>
                      <span
                        className={[
                          'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
                          certificate.status === 'validated'
                            ? 'bg-green-100 text-green-700'
                            : certificate.status === 'expiring'
                            ? 'bg-amber-100 text-amber-700'
                            : certificate.status === 'expired'
                            ? 'bg-red-100 text-red-700'
                            : certificate.status === 'invalid'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-slate-100 text-slate-600',
                        ].join(' ')}
                      >
                        {STATUS_FILTERS.find((option) => option.value === certificate.status)?.label ?? certificate.status}
                      </span>
                    </div>
                    <dl className="mt-4 space-y-2 text-sm text-slate-600">
                      <div className="flex justify-between">
                        <dt className="text-slate-400">Issuing body</dt>
                        <dd>{certificate.issuingBody || '—'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-400">Expiry date</dt>
                        <dd>{certificate.expiryDate ? new Date(certificate.expiryDate).toLocaleDateString() : '—'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-400">Volume</dt>
                        <dd>
                          {certificate.volume?.amount
                            ? `${certificate.volume.amount} ${certificate.volume.unit || ''}`.trim()
                            : '—'}
                        </dd>
                      </div>
                    </dl>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}









