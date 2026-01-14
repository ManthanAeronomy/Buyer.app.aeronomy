import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import connectDB from '@/lib/mongodb'
import Membership from '@/models/Membership'
import CertificateWorkspace from '@/components/certificates/CertificateWorkspace'

export default async function CertificatesPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  await connectDB()
  const membership = await Membership.findOne({ userId }).lean()

  if (!membership) {
    redirect('/onboarding')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <CertificateWorkspace orgId={membership.orgId.toString()} />
      </div>
    </div>
  )
}



















