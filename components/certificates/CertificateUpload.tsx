'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import { Upload, FileText, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { CertificateRecord } from '@/lib/certificates/types'

type UploadStatus = 'queued' | 'uploading' | 'completed' | 'error'

interface UploadItem {
  id: string
  file: File
  status: UploadStatus
  progress: number
  message?: string
  startedAt?: Date
  completedAt?: Date
  certificate?: CertificateRecord
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

function randomId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)
}

interface CertificateUploadProps {
  orgId?: string
  onCertificatesCreated?(certificates: CertificateRecord[]): void
}

export default function CertificateUpload({ orgId, onCertificatesCreated }: CertificateUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploads, setUploads] = useState<UploadItem[]>([])

  const hasActiveUploads = useMemo(
    () => uploads.some((item) => item.status === 'uploading' || item.status === 'queued'),
    [uploads]
  )

  const handleUploadCompletion = useCallback(
    (id: string, certificate?: CertificateRecord, message?: string) => {
      setUploads((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                certificate: certificate ? { ...certificate } : item.certificate,
                status: certificate ? 'completed' : 'error',
                progress: certificate ? 100 : item.progress,
                completedAt: new Date(),
                message: message || item.message,
              }
            : item
        )
      )

      if (certificate && onCertificatesCreated) {
        onCertificatesCreated([certificate])
      }
    },
    [onCertificatesCreated]
  )

  const uploadFile = useCallback(
    (item: UploadItem) => {
      const formData = new FormData()
      formData.append('files', item.file)
      if (orgId) {
        formData.append('orgId', orgId)
      }

      const xhr = new XMLHttpRequest()
      xhr.open('POST', '/api/certificates/upload')

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return
        const percent = Math.floor((event.loaded / event.total) * 90)
        setUploads((prev) =>
          prev.map((upload) =>
            upload.id === item.id
              ? { ...upload, progress: percent, status: 'uploading' }
              : upload
          )
        )
      }

      xhr.onload = () => {
        try {
          const response = JSON.parse(xhr.responseText)
          if (xhr.status >= 200 && xhr.status < 300) {
            const firstResult = response.results?.[0]
            if (firstResult?.success) {
              handleUploadCompletion(item.id, firstResult.certificate as CertificateRecord)
            } else {
              handleUploadCompletion(item.id, undefined, firstResult?.error || 'Upload failed')
            }
          } else {
            handleUploadCompletion(item.id, undefined, response.error || 'Upload failed')
          }
        } catch (error) {
          handleUploadCompletion(item.id, undefined, 'Unable to parse upload response')
        }
      }

      xhr.onerror = () => {
        handleUploadCompletion(item.id, undefined, 'Network error during upload')
      }

      xhr.send(formData)

      setUploads((prev) =>
        prev.map((upload) =>
          upload.id === item.id
            ? { ...upload, status: 'uploading', startedAt: new Date(), progress: 5 }
            : upload
        )
      )
    },
    [handleUploadCompletion, orgId]
  )

  const enqueueFiles = useCallback((files: FileList | File[]) => {
    const nextItems: UploadItem[] = []
    Array.from(files).forEach((file) => {
      if (!file.type) {
        // Only accept PDF / image formats for now
        return
      }
      const isSupported =
        file.type === 'application/pdf' ||
        file.type.startsWith('image/')

      if (!isSupported) {
        nextItems.push({
          id: randomId(),
          file,
          status: 'error',
          progress: 0,
          message: 'Unsupported file type',
        })
        return
      }

      nextItems.push({
        id: randomId(),
        file,
        status: 'queued',
        progress: 0,
      })
    })

    if (nextItems.length) {
      setUploads((prev) => [...prev, ...nextItems])
      nextItems
        .filter((item) => item.status === 'queued')
        .forEach((item) => uploadFile(item))
    }
  }, [uploadFile])

  const handleFilesSelected = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length) {
      enqueueFiles(files)
    }
    event.target.value = ''
  }, [enqueueFiles])

  const handleDragEnter = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (event.currentTarget === event.target) {
      setDragActive(false)
    }
  }, [])

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
  }, [])

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setDragActive(false)
    if (event.dataTransfer.files && event.dataTransfer.files.length) {
      enqueueFiles(event.dataTransfer.files)
    }
  }, [enqueueFiles])

  const removeUpload = useCallback((id: string) => {
    setUploads((prev) => prev.filter((item) => item.id !== id))
  }, [])

  return (
    <div className="space-y-8">
      <section>
        <div
          className={[
            'relative flex min-h-[280px] flex-col items-center justify-center rounded-3xl border-2 border-dashed bg-white px-8 py-14 text-center transition',
            dragActive
              ? 'border-primary-400 bg-primary-50/50'
              : 'border-slate-200 hover:border-primary-200 hover:bg-primary-50/30',
          ].join(' ')}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          role="presentation"
        >
          <div className="flex flex-col items-center gap-6">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-600">
              <Upload className="h-7 w-7" aria-hidden="true" />
            </span>
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-slate-900">
                Drag & drop SAF certificates
              </h2>
              <p className="text-sm text-slate-600">
                Upload PDF or image files to ingest automatically. Each file will run through OCR and be queued for validation.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                onClick={() => inputRef.current?.click()}
                type="button"
              >
                Select files
              </button>
              <span className="text-xs uppercase tracking-wide text-slate-400">
                or drop them here
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Accepted formats: PDF, PNG, JPG. Max 20 MB per file.
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,image/*"
            multiple
            onChange={handleFilesSelected}
            className="hidden"
          />
        </div>
      </section>

      <section aria-live="polite" className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Upload Queue</h3>
          {hasActiveUploads && (
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              Processing…
            </span>
          )}
        </div>

        {uploads.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-sm text-slate-500">
            Certificates awaiting upload will appear here with real-time progress and OCR status.
          </div>
        ) : (
          <ul className="space-y-4">
            {uploads.map((item) => {
              const formattedSize = formatBytes(item.file.size)
              let statusLabel: string
              let statusIcon = null
              let statusClass = 'text-slate-500'

              switch (item.status) {
                case 'queued':
                  statusLabel = 'Queued'
                  statusIcon = <FileText className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  statusClass = 'text-slate-500'
                  break
                case 'uploading':
                  statusLabel = 'Uploading'
                  statusIcon = <Loader2 className="h-4 w-4 animate-spin text-primary-500" aria-hidden="true" />
                  statusClass = 'text-primary-600'
                  break
                case 'completed':
                  statusLabel = 'Uploaded'
                  statusIcon = <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden="true" />
                  statusClass = 'text-green-600'
                  break
                case 'error':
                  statusLabel = item.message || 'Error'
                  statusIcon = <AlertCircle className="h-4 w-4 text-red-500" aria-hidden="true" />
                  statusClass = 'text-red-600'
                  break
                default:
                  statusLabel = 'Unknown'
              }

              const certificate = item.certificate
              return (
                <li
                  key={item.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-1 items-start gap-4">
                      <span className="mt-1 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                        <FileText className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-900">{item.file.name}</p>
                        <p className="text-xs text-slate-500">{formattedSize}</p>
                        <div className="flex items-center gap-2 text-xs font-medium">
                          {statusIcon}
                          <span className={statusClass}>{statusLabel}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-48">
                        <div className="relative h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={[
                              'h-full rounded-full transition-all',
                              item.status === 'completed'
                                ? 'bg-green-500'
                                : item.status === 'error'
                                ? 'bg-red-500'
                                : 'bg-primary-500',
                            ].join(' ')}
                            style={{ width: `${item.progress}%` }}
                            aria-hidden="true"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        className="rounded-full border border-slate-200 p-2 text-slate-400 transition hover:border-slate-300 hover:text-slate-600"
                        onClick={() => removeUpload(item.id)}
                        aria-label={`Remove ${item.file.name} from queue`}
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  {certificate && (
                    <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 text-sm text-slate-600">
                      <p className="font-medium text-slate-700">OCR Summary</p>
                      <div className="mt-2 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-400">Certificate Type</p>
                          <p className="text-sm text-slate-700">{certificate.type?.toUpperCase() || 'Detected: Other'}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-400">Issuing Body</p>
                          <p className="text-sm text-slate-700">{certificate.issuingBody || 'Pending review'}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-400">Volume</p>
                          <p className="text-sm text-slate-700">
                            {certificate.volume?.amount
                              ? `${certificate.volume.amount} ${certificate.volume.unit || ''}`.trim()
                              : 'Not extracted'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-400">Issue Date</p>
                          <p className="text-sm text-slate-700">
                            {certificate.issueDate ? new Date(certificate.issueDate).toLocaleDateString() : '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-400">Expiry Date</p>
                          <p className="text-sm text-slate-700">
                            {certificate.expiryDate ? new Date(certificate.expiryDate).toLocaleDateString() : '—'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

