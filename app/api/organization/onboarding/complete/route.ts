import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Organization from '@/models/Organization'
import { resolveUserOrgId } from '@/lib/certificates/service'

import User from '@/models/User'

export async function POST(req: NextRequest) {
    try {
        const { userId } = auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await connectDB()
        const orgId = await resolveUserOrgId(userId)
        if (!orgId) {
            return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
        }

        const organization = await Organization.findById(orgId)
        if (!organization) {
            return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
        }

        organization.onboardingStatus = 'completed'
        await organization.save()
        
        // Update User flag as well
        await User.findOneAndUpdate(
            { clerkId: userId },
            { isOnboardingComplete: true }
        )

        return NextResponse.json({ success: true, organization })
    } catch (error) {
        console.error('Error completing onboarding:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
