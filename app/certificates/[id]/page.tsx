import { auth } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'
import connectDB from '@/lib/mongodb'
import Certificate from '@/models/Certificate'
import Membership from '@/models/Membership'
import CertificateDetailClient from '@/components/certificates/CertificateDetailClient'

interface Params {
  params: {
    id: string
  }
}

export default async function CertificateDetailPage({ params }: Params) {
  const { userId } = await auth()
  if (!userId) {
    redirect('/sign-in')
  }

  await connectDB()
  const membership = await Membership.findOne({ userId }).lean()

  if (!membership) {
    redirect('/onboarding')
  }

  const certificate = await Certificate.findOne({
    _id: params.id,
    orgId: membership.orgId,
  }).lean()

  if (!certificate) {
    notFound()
  }

  const serialised = JSON.parse(JSON.stringify(certificate))

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <CertificateDetailClient initialCertificate={serialised} />
      </div>
    </div>
  )
}









