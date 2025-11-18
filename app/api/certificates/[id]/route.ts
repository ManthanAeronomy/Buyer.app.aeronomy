import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Certificate from '@/models/Certificate'
import { determineCertificateStatus } from '@/lib/certificates/status'

interface Params {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: Params) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()

  const certificate = await Certificate.findById(params.id).lean()

  if (!certificate) {
    return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
  }

  return NextResponse.json({ certificate })
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()

  const body = await request.json()
  const update: Record<string, unknown> = {}

  if (body.type) update.type = body.type
  if (body.issuingBody) update.issuingBody = body.issuingBody
  if (body.issueDate) update.issueDate = body.issueDate
  if (body.expiryDate) update.expiryDate = body.expiryDate
  if (body.volume) update.volume = body.volume
  if (body.status) update.status = body.status

  const certificate = await Certificate.findByIdAndUpdate(
    params.id,
    { $set: update },
    { new: true }
  )

  if (!certificate) {
    return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
  }

  certificate.status = determineCertificateStatus(certificate.expiryDate)
  await certificate.save()

  return NextResponse.json({ certificate })
}









