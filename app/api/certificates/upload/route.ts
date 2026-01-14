import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createCertificateFromUpload } from '@/lib/certificates/service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const files = formData.getAll('files')
  const orgId = formData.get('orgId')?.toString()

  if (!files.length) {
    return NextResponse.json({ error: 'No files provided' }, { status: 400 })
  }

  const results = []

  for (const item of files) {
    if (!(item instanceof File)) {
      continue
    }

    const arrayBuffer = await item.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    try {
      const certificate = await createCertificateFromUpload({
        userId,
        buffer,
        filename: item.name,
        mimeType: item.type || 'application/octet-stream',
        size: item.size,
        orgId,
      })

      results.push({
        success: true,
        certificate,
      })
    } catch (error: any) {
      results.push({
        success: false,
        error: error.message || 'Failed to process certificate',
        filename: item.name,
      })
    }
  }

  return NextResponse.json({ results })
}



















