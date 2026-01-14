'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Download, ExternalLink } from 'lucide-react'
import CertificateEditor from './CertificateEditor'
import { CertificateRecord } from '@/lib/certificates/types'

interface CertificateDetailClientProps {
  initialCertificate: CertificateRecord
}

export default function CertificateDetailClient({ initialCertificate }: CertificateDetailClientProps) {
  const [certificate, setCertificate] = useState<CertificateRecord>(initialCertificate)

  const isPdf = certificate.file?.mime === 'application/pdf'
  const isImage = certificate.file?.mime?.startsWith('image/')

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary-500">Certificate Detail</p>
        <h1 className="text-3xl font-bold text-slate-900">
          {certificate.file?.originalName || 'Certificate'}
        </h1>
        <p className="text-sm text-slate-500">
          Review the OCR results, adjust metadata, and access the stored certificate asset. All edits are logged for compliance.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
        <div className="space-y-6">
          <CertificateEditor certificate={certificate} onUpdated={setCertificate} />

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">OCR Extracted Text</h2>
            <p className="mt-2 text-xs uppercase tracking-wide text-slate-400">
              {certificate.extracted?.engine === 'pdf' ? 'PDF parser' : 'Tesseract OCR'}
            </p>
            <pre className="mt-4 max-h-64 overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
              {certificate.extracted?.text || 'No OCR text captured for this certificate.'}
            </pre>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Document Preview</h3>
            <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">Secure viewer</p>
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              {certificate.file?.url ? (
                isPdf ? (
                  <object
                    data={certificate.file.url}
                    type="application/pdf"
                    className="h-80 w-full"
                  >
                    <p className="p-4 text-sm text-slate-500">
                      PDF preview is unavailable in this browser.{' '}
                      <Link href={certificate.file.url} className="text-primary-600 underline">
                        Download the file instead.
                      </Link>
                    </p>
                  </object>
                ) : isImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={certificate.file.url}
                    alt={certificate.file.originalName || 'Certificate preview'}
                    className="h-80 w-full object-contain bg-white"
                  />
                ) : (
                  <div className="flex h-80 items-center justify-center bg-slate-100 text-sm text-slate-500">
                    Preview not available for this file type.
                  </div>
                )
              ) : (
                <div className="flex h-80 items-center justify-center bg-slate-100 text-sm text-slate-500">
                  File not available.
                </div>
              )}
            </div>
            {certificate.file?.url && (
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href={certificate.file.url}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in new tab
                </Link>
                <Link
                  href={certificate.file.url}
                  download={certificate.file.originalName || 'certificate.pdf'}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                >
                  <Download className="h-4 w-4" />
                  Download file
                </Link>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Metadata</h3>
            <dl className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between">
                <dt className="text-slate-400">Certificate type</dt>
                <dd>{certificate.type?.toUpperCase()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Issuing body</dt>
                <dd>{certificate.issuingBody || '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Issue date</dt>
                <dd>{certificate.issueDate ? new Date(certificate.issueDate).toLocaleDateString() : '—'}</dd>
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
              <div className="flex justify-between">
                <dt className="text-slate-400">Status</dt>
                <dd>{certificate.status}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  )
}



















