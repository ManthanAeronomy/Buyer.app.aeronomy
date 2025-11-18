import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import { listCertificates, resolveUserOrgId, recalculateCertificateStatuses } from '@/lib/certificates/service'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()
  const orgId = (await resolveUserOrgId(userId)) || undefined

  if (!orgId) {
    return NextResponse.json({ error: 'No organization membership found' }, { status: 400 })
  }

  const searchParams = request.nextUrl.searchParams
  const filters = {
    status: searchParams.get('status') || undefined,
    issuingBody: searchParams.get('issuingBody') || undefined,
    type: searchParams.get('type') || undefined,
  }

  await recalculateCertificateStatuses(orgId)
  const certificates = await listCertificates(orgId, filters)

  return NextResponse.json({ certificates })
}









