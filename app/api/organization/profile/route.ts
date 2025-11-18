import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Organization from '@/models/Organization'
import { resolveUserOrgId } from '@/lib/certificates/service'

export async function GET(req: NextRequest) {
    try {
        const { userId } = auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await connectDB()
        const orgId = await resolveUserOrgId(userId)
        
        // If no organization found, return specific status to let frontend know it's a new setup
        if (!orgId) {
            return NextResponse.json({ isNew: true })
        }

        const organization = await Organization.findById(orgId)
        if (!organization) {
            // Edge case: Membership exists but Org doesn't? Treat as new.
            return NextResponse.json({ isNew: true })
        }

        return NextResponse.json(organization)
    } catch (error) {
        console.error('Error fetching organization profile:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

import Membership from '@/models/Membership'

export async function PUT(req: NextRequest) {
    try {
        const { userId } = auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        await connectDB()
        let orgId = await resolveUserOrgId(userId)
        
        let organization;

        // Create new organization if one doesn't exist
        if (!orgId) {
            // Validate minimum requirements for creation
            if (!body.legalEntity?.legalName) {
                return NextResponse.json({ error: 'Legal Name is required to create organization' }, { status: 400 })
            }

            // Create Organization
            organization = await Organization.create({
                name: body.legalEntity.legalName,
                type: 'airline', // Default to airline for this flow
                onboardingStatus: 'in_progress',
                legalEntity: body.legalEntity,
                // Map other fields if provided
                ...body
            })

            // Create Membership (Admin role for creator)
            await Membership.create({
                orgId: organization._id,
                userId,
                role: body.userRole || 'admin' // Use provided role or default to admin
            })

            orgId = organization._id.toString()
        } else {
            organization = await Organization.findById(orgId)
            if (!organization) {
                return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
            }

            // Update fields
            if (body.legalEntity) {
                organization.legalEntity = body.legalEntity
                // Also update main name if legal name changes
                if (body.legalEntity.legalName) {
                    organization.name = body.legalEntity.legalName
                }
            }
            if (body.corporateStructure) organization.corporateStructure = body.corporateStructure
            if (body.contactPoints) organization.contactPoints = body.contactPoints
            if (body.compliance) organization.compliance = body.compliance
            if (body.operational) organization.operational = body.operational
            if (body.safDemand) organization.safDemand = body.safDemand
            if (body.procurement) organization.procurement = body.procurement
            if (body.financial) organization.financial = body.financial
            if (body.sustainability) organization.sustainability = body.sustainability
            if (body.governance) organization.governance = body.governance
            if (body.integrations) organization.integrations = body.integrations

            // Update status to in_progress if it was pending
            if (organization.onboardingStatus === 'pending') {
                organization.onboardingStatus = 'in_progress'
            }

            await organization.save()
            
            // If userRole is provided, update the user's membership role
            if (body.userRole) {
                 await Membership.findOneAndUpdate(
                    { orgId: organization._id, userId },
                    { role: body.userRole }
                )
            }
        }

        return NextResponse.json(organization)
    } catch (error: any) {
        console.error('Error updating organization profile:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
