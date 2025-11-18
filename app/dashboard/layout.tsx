import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import connectDB from '@/lib/mongodb'
import Organization from '@/models/Organization'
import { resolveUserOrgId } from '@/lib/certificates/service'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { userId } = auth()

    if (!userId) {
        redirect('/sign-in')
    }

    await connectDB()
    const orgId = await resolveUserOrgId(userId)

    if (!orgId) {
        // User has no organization yet, redirect to onboarding to create one
        redirect('/onboarding/organization')
    }

    // Check organization status
    const organization = await Organization.findById(orgId).select('onboardingStatus type').lean()
    let needsOnboarding = false

    if (organization) {
        // Handle legacy data: if type is missing, assume 'airline'
        // If onboardingStatus is missing, assume 'pending'
        const type = organization.type || 'airline'
        const status = organization.onboardingStatus || 'pending'

        // Only redirect airlines to onboarding if not completed
        if (type === 'airline' && status !== 'completed') {
            needsOnboarding = true
        }
    } else {
        // Edge case: Has orgId (from Membership?) but no Org document
        needsOnboarding = true
    }

    if (needsOnboarding) {
        redirect('/onboarding/organization')
    }
    
    return (
        <>
            {children}
        </>
    )
}
