import { Types } from 'mongoose'
import Lot, { ILot, LotStatus, LotType } from '@/models/Lot'
import { resolveUserOrgId } from '@/lib/certificates/service'
import { notifyLotCreated, notifyLotUpdated, notifyLotDeleted } from '@/lib/webhooks/lot-webhook'
import connectDB from '@/lib/mongodb'
import Organization from '@/models/Organization'

export interface LotFilters {
  status?: LotStatus
  type?: LotType
  orgId?: string
  minPrice?: number
  maxPrice?: number
  standards?: string[]
  search?: string
}

export async function listLots(filters: LotFilters = {}) {
  const query: any = {}

  // Only show published lots by default (unless filtering by status)
  if (!filters.status) {
    query.status = 'published'
  } else {
    query.status = filters.status
  }

  if (filters.type) {
    query.type = filters.type
  }

  if (filters.orgId) {
    query.orgId = new Types.ObjectId(filters.orgId)
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    query['pricing.price'] = {}
    if (filters.minPrice !== undefined) {
      query['pricing.price'].$gte = filters.minPrice
    }
    if (filters.maxPrice !== undefined) {
      query['pricing.price'].$lte = filters.maxPrice
    }
  }

  if (filters.standards && filters.standards.length > 0) {
    query['compliance.standards'] = { $in: filters.standards }
  }

  // Build $or conditions for search
  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
      { airlineName: { $regex: filters.search, $options: 'i' } },
    ]
  }

  // Don't show expired lots (only for published lots)
  if (!filters.status || filters.status === 'published') {
    const andConditions: any[] = [
      {
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: null },
          { expiresAt: { $gte: new Date() } },
        ],
      },
    ]

    // If we have search conditions, combine them properly
    if (filters.search && query.$or) {
      query.$and = [
        ...andConditions,
        { $or: query.$or },
      ]
      delete query.$or
    } else {
      query.$and = andConditions
    }
  }

  const lots = await Lot.find(query)
    .populate('orgId', 'name branding')
    .populate('compliance.certificates')
    .sort({ publishedAt: -1, createdAt: -1 })
    .lean()

  return lots
}

export async function getLotById(lotId: string) {
  const lot = await Lot.findById(lotId)
    .populate('orgId', 'name branding')
    .populate('compliance.certificates')
    .lean()

  return lot
}

export async function createLot(userId: string, lotData: Partial<ILot>) {
  await connectDB()
  const orgId = await resolveUserOrgId(userId)
  if (!orgId) {
    throw new Error('No organization membership found')
  }

  const lot = new Lot({
    ...lotData,
    orgId: new Types.ObjectId(orgId),
    postedBy: userId, // Store Clerk userId as string
    status: lotData.status || 'draft',
  })

  // If status is published, set publishedAt
  if (lot.status === 'published') {
    lot.publishedAt = new Date()
  }

  await lot.save()
  
  // Fetch organization for webhook
  const organization = await Organization.findById(orgId).lean()
  
  // Send webhook notification (non-blocking)
  notifyLotCreated(lot.toObject(), organization).catch((err) => {
    console.error('Failed to send lot.created webhook:', err)
  })
  
  return lot
}

export async function updateLot(lotId: string, userId: string, updates: Partial<ILot>) {
  await connectDB()
  const lot = await Lot.findById(lotId)
  if (!lot) {
    throw new Error('Lot not found')
  }

  // Verify ownership
  const orgId = await resolveUserOrgId(userId)
  if (!orgId || lot.orgId.toString() !== orgId.toString()) {
    throw new Error('Unauthorized: You can only update your own lots')
  }

  // If status is changing to published, set publishedAt
  if (updates.status === 'published' && lot.status !== 'published') {
    updates.publishedAt = new Date()
  }

  Object.assign(lot, updates)
  await lot.save()
  
  // Fetch organization for webhook
  const organization = await Organization.findById(lot.orgId).lean()
  
  // Send webhook notification (non-blocking)
  notifyLotUpdated(lot.toObject(), organization).catch((err) => {
    console.error('Failed to send lot.updated webhook:', err)
  })
  
  return lot
}

export async function deleteLot(lotId: string, userId: string) {
  await connectDB()
  const lot = await Lot.findById(lotId)
  if (!lot) {
    throw new Error('Lot not found')
  }

  // Verify ownership
  const orgId = await resolveUserOrgId(userId)
  if (!orgId || lot.orgId.toString() !== orgId.toString()) {
    throw new Error('Unauthorized: You can only delete your own lots')
  }

  // Store lot data before deletion for webhook
  const lotData = lot.toObject()
  const organization = await Organization.findById(lot.orgId).lean()
  
  await Lot.findByIdAndDelete(lotId)
  
  // Send webhook notification (non-blocking)
  notifyLotDeleted(lotData, organization).catch((err) => {
    console.error('Failed to send lot.deleted webhook:', err)
  })
  
  return { success: true }
}

export async function incrementLotViews(lotId: string) {
  await Lot.findByIdAndUpdate(lotId, { $inc: { views: 1 } })
}

export async function getUserLots(userId: string, includeDrafts: boolean = true) {
  const orgId = await resolveUserOrgId(userId)
  if (!orgId) {
    return []
  }

  const query: any = { orgId: new Types.ObjectId(orgId) }
  if (!includeDrafts) {
    query.status = { $ne: 'draft' }
  }

  const lots = await Lot.find(query)
    .populate('orgId', 'name branding')
    .populate('compliance.certificates')
    .sort({ createdAt: -1 })
    .lean()

  return lots
}

