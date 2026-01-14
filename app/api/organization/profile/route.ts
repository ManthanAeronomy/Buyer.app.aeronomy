import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/mongodb'
import Organization from '@/models/Organization'
import Membership from '@/models/Membership'
import { resolveUserOrgId } from '@/lib/certificates/service'
import { resolveMongoUserId } from '@/lib/user-resolver'

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

        // Get user's role from membership (resolve Clerk userId to MongoDB User ObjectId)
        const mongoUserId = await resolveMongoUserId(userId)
        const membership = await Membership.findOne({ orgId: organization._id, userId: mongoUserId }).lean()
        const userRole = membership?.role || 'admin'

        // Return organization with user role
        return NextResponse.json({
            ...organization.toObject(),
            userRole,
            userName: organization.userName,
            companyName: organization.name,
            companyEmail: organization.companyEmail,
            teamSize: organization.teamSize,
            headquarters: organization.headquarters,
            entityType: organization.entityType,
            organizationType: organization.organizationType,
            intent: organization.intent,
            volumeRange: organization.volumeRange,
            requirements: organization.requirements,
            targetAirports: organization.targetAirports,
            emailPreferences: organization.emailPreferences,
        })
    } catch (error) {
        console.error('Error fetching organization profile:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

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
            if (!body.name) {
                return NextResponse.json({ error: 'Company name is required to create organization' }, { status: 400 })
            }

            // Create Organization with simplified data
            organization = await Organization.create({
                name: body.name,
                type: body.organizationType || 'airline', // Use the selected organization type
                onboardingStatus: 'in_progress',
                // Store simplified data in legalEntity for backward compatibility
                legalEntity: {
                    legalName: body.name,
                } as any,
                // Store additional fields
                userName: body.userName,
                companyEmail: body.companyEmail,
                teamSize: body.teamSize,
                headquarters: body.headquarters,
                entityType: body.entityType,
                organizationType: body.organizationType,
                intent: body.intent,
                volumeRange: body.volumeRange,
                requirements: body.requirements,
                targetAirports: body.targetAirports || [],
            })

            // Create Membership with admin role by default (resolve Clerk userId to MongoDB User ObjectId)
            const mongoUserId = await resolveMongoUserId(userId)
            await Membership.create({
                orgId: organization._id,
                userId: mongoUserId, // MongoDB User ObjectId reference
                role: 'admin'
            })

            orgId = organization._id.toString()
        } else {
            organization = await Organization.findById(orgId)
            if (!organization) {
                return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
            }

            // Update simplified fields
            if (body.name) {
                organization.name = body.name
                // Also update legalEntity.legalName for backward compatibility
                if (!organization.legalEntity) {
                    organization.legalEntity = { legalName: body.name } as any
                } else {
                    organization.legalEntity.legalName = body.name
                }
            }

            if (body.userName !== undefined) {
                organization.userName = body.userName
            }

            if (body.companyEmail !== undefined) {
                organization.companyEmail = body.companyEmail
            }

            if (body.teamSize !== undefined) {
                organization.teamSize = body.teamSize
            }

            if (body.headquarters !== undefined) {
                organization.headquarters = body.headquarters
            }

            if (body.entityType !== undefined) {
                organization.entityType = body.entityType
            }

            if (body.organizationType) {
                organization.organizationType = body.organizationType
                // Update type field as well
                organization.type = body.organizationType
            }

            if (body.intent !== undefined) {
                organization.intent = body.intent
            }

            if (body.volumeRange !== undefined) {
                organization.volumeRange = body.volumeRange
            }

            if (body.requirements !== undefined) {
                organization.requirements = body.requirements
            }

            if (body.targetAirports !== undefined) {
                organization.targetAirports = body.targetAirports
            }

            if (body.emailPreferences !== undefined) {
                organization.emailPreferences = body.emailPreferences
            }

            // Update status to in_progress if it was pending
            if (organization.onboardingStatus === 'pending') {
                organization.onboardingStatus = 'in_progress'
            }

            await organization.save()
        }

        return NextResponse.json(organization)
    } catch (error: any) {
        console.error('Error updating organization profile:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}

