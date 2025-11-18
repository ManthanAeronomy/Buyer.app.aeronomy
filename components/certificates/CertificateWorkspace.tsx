'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import CertificateUpload from './CertificateUpload'
import CertificateList from './CertificateList'
import CertificateEditor from './CertificateEditor'
import { CertificateRecord } from '@/lib/certificates/types'

interface CertificateWorkspaceProps {
  orgId?: string
}

export default function CertificateWorkspace({ orgId }: CertificateWorkspaceProps) {
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateRecord | null>(null)
  const [refreshCounter, setRefreshCounter] = useState(0)

  const handleCreated = useCallback((certificates: CertificateRecord[]) => {
    if (certificates.length) {
      setSelectedCertificate(certificates[0])
      setRefreshCounter((value) => value + 1)
    }
  }, [])

  const handleUpdated = useCallback((certificate: CertificateRecord) => {
    setSelectedCertificate(certificate)
    setRefreshCounter((value) => value + 1)
  }, [])

  return (
    <div className="space-y-12">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary-500">Certificate Intake</p>
            <h2 className="text-3xl font-bold text-slate-900">Upload & ingest SAF certificates</h2>
            <p className="max-w-2xl text-sm text-slate-600">
              Drag-and-drop your certificates to kick off OCR extraction and compliance validation. Each file runs through automated parsing, then lands in the review table below for manual verification.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
          >
            Return to dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8">
          <CertificateUpload orgId={orgId} onCertificatesCreated={handleCreated} />
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-500">Review queue</p>
          <h2 className="text-2xl font-semibold text-slate-900">Certificates in workspace</h2>
        </div>
        <CertificateList
          refreshSignal={refreshCounter}
          onSelect={(certificate) => {
            setSelectedCertificate(certificate)
          }}
        />
      </section>

      {selectedCertificate && (
        <section className="space-y-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary-500">Manual review</p>
            <h2 className="text-2xl font-semibold text-slate-900">
              {selectedCertificate.file?.originalName || 'Certificate'}
            </h2>
            <p className="text-sm text-slate-500">
              Verify extracted data, adjust important fields, then save. You can open the full detail page anytime for richer context or to preview the document.
            </p>
          </div>

          <CertificateEditor certificate={selectedCertificate} onUpdated={handleUpdated} />

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <Link
              href={`/certificates/${selectedCertificate._id}`}
              className="inline-flex items-center gap-2 font-medium text-primary-600"
            >
              Open detail page
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}









