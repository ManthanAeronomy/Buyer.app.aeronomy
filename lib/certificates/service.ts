import path from 'path'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Certificate, { ICertificate } from '@/models/Certificate'
import Membership from '@/models/Membership'
import { resolveMongoUserId } from '@/lib/user-resolver'
import { computeFileChecksum, extractCertificateData } from './extractor'
import { determineCertificateStatus } from './status'
import { persistFile, buildPublicUrl } from '@/lib/storage'

interface CreateCertificateInput {
  userId: string
  buffer: Buffer
  filename: string
  mimeType: string
  size: number
  orgId?: string
}

export async function resolveUserOrgId(clerkUserId: string) {
  await connectDB()
  // Resolve Clerk userId to MongoDB User ObjectId
  const mongoUserId = await resolveMongoUserId(clerkUserId)
  const membership = await Membership.findOne({ userId: mongoUserId }).lean()
  return membership?.orgId?.toString()
}

export async function createCertificateFromUpload({
  userId,
  buffer,
  filename,
  mimeType,
  size,
  orgId,
}: CreateCertificateInput) {
  await connectDB()

  const targetOrgId = orgId || (await resolveUserOrgId(userId))
  if (!targetOrgId) {
    throw new Error('No organization membership found for user')
  }

  const extension = path.extname(filename) || '.bin'
  const storageKey = `certificates/${Date.now()}-${Math.random().toString(36).slice(2)}${extension}`
  const sha256 = computeFileChecksum(buffer)

  await persistFile(buffer, storageKey)

  let extracted
  try {
    extracted = await extractCertificateData(buffer, mimeType)
  } catch (error) {
    console.error('Failed to extract certificate data', error)
    extracted = {
      rawText: '',
      ocrEngine: mimeType === 'application/pdf' ? 'pdf' : 'tesseract',
    }
  }

  const status = determineCertificateStatus((extracted as any).expiryDate ?? undefined)

  const certificate = await Certificate.create({
    orgId: targetOrgId,
    type: (extracted as any).type || 'other',
    issuingBody: (extracted as any).issuingBody,
    issueDate: (extracted as any).issueDate,
    expiryDate: (extracted as any).expiryDate,
    volume: (extracted as any).volume,
    extracted: {
      text: extracted.rawText,
      engine: extracted.ocrEngine,
    },
    status,
    uploadedBy: userId,
    file: {
      storageKey,
      url: buildPublicUrl(storageKey),
      mime: mimeType,
      size,
      originalName: filename,
      sha256,
    },
  })

  return certificate.toObject()
}

export async function updateCertificateStatus(certificate: ICertificate) {
  const status = determineCertificateStatus(certificate.expiryDate)
  if (status !== certificate.status) {
    certificate.status = status
    await certificate.save()
  }
  return certificate
}

export async function recalculateCertificateStatuses(orgId: string) {
  await connectDB()
  const certificates = await Certificate.find({ orgId })
  await Promise.all(certificates.map((certificate) => updateCertificateStatus(certificate)))
}

export async function listCertificates(orgId: string, filters: Record<string, string | undefined>) {
  await connectDB()
  const query: Record<string, unknown> = { orgId }

  if (filters.status) {
    query.status = filters.status
  }

  if (filters.issuingBody) {
    query.issuingBody = filters.issuingBody
  }

  if (filters.type) {
    query.type = filters.type
  }

  const certificates = await Certificate.find(query).sort({ createdAt: -1 }).lean()
  return certificates
}

