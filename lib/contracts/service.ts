import { Types } from 'mongoose'
import Contract, { IContract, ContractStatus } from '@/models/Contract'
import Bid from '@/models/Bid'
import Lot from '@/models/Lot'
import { resolveUserOrgId } from '@/lib/certificates/service'
import connectDB from '@/lib/mongodb'

export interface CreateContractData {
  lotId: string
  bidId: string
  title: string
  description?: string
  terms?: string
}

/**
 * Create a contract from an accepted bid
 */
export async function createContractFromBid(
  userId: string,
  bidId: string,
  contractData?: Partial<CreateContractData>
): Promise<IContract> {
  await connectDB()

  // Get the bid
  const bid = await Bid.findById(bidId).populate('lotId')
  if (!bid) {
    throw new Error('Bid not found')
  }

  // Verify bid is accepted
  if (bid.status !== 'accepted') {
    throw new Error('Bid must be accepted before creating a contract')
  }

  // Get user's organization (seller)
  const sellerOrgId = await resolveUserOrgId(userId)
  if (!sellerOrgId) {
    throw new Error('No organization membership found')
  }

  // Verify user owns the lot
  const lot = bid.lotId as any
  if (lot.orgId.toString() !== sellerOrgId) {
    throw new Error('Unauthorized: You can only create contracts for your own lots')
  }

  // Get lot title for contract title if not provided
  const contractTitle = contractData?.title || `${lot.title} - Contract`

  // Create contract
  const contract = await Contract.create({
    lotId: lot._id,
    bidId: bid._id,
    sellerOrgId: new Types.ObjectId(sellerOrgId),
    buyerName: bid.bidderName,
    buyerEmail: bid.bidderEmail,
    contractNumber: '', // Will be auto-generated
    title: contractTitle,
    description: contractData?.description || bid.message || lot.description,
    volume: bid.volume,
    pricing: bid.pricing,
    delivery: bid.deliveryDate || bid.deliveryLocation
      ? {
        deliveryDate: bid.deliveryDate ? new Date(bid.deliveryDate) : undefined,
        deliveryLocation: bid.deliveryLocation,
      }
      : lot.delivery,
    compliance: lot.compliance,
    status: 'pending_signature',
    terms: contractData?.terms,
  })

  // Update lot status to sold
  await Lot.findByIdAndUpdate(lot._id, { status: 'sold' })

  return contract
}

/**
 * Create a contract from a bid when the producer accepts the buyer's counter-offer.
 * Uses bid.counterOffer for volume and pricing.
 */
export async function createContractFromCounterOffer(bidId: string): Promise<IContract> {
  await connectDB()

  const bid = await Bid.findById(bidId).populate('lotId')
  if (!bid) throw new Error('Bid not found')

  const co = (bid as any).counterOffer
  if (!co || !co.volume?.amount || co.price == null) {
    throw new Error('Bid has no valid counter-offer to accept')
  }

  if (bid.status !== 'pending') {
    throw new Error('Bid is not pending; counter-offer may already have been accepted or rejected')
  }

  const lot = bid.lotId as any
  const sellerOrgId = lot.orgId
  const currency = (bid as any).pricing?.currency || 'USD'

  const contract = await Contract.create({
    lotId: lot._id,
    bidId: bid._id,
    sellerOrgId,
    buyerName: (bid as any).bidderName,
    buyerEmail: (bid as any).bidderEmail,
    contractNumber: '',
    title: `${lot.title} - Contract (Counter-offer accepted)`,
    description: (bid as any).message || lot.description,
    volume: { amount: co.volume.amount, unit: co.volume.unit || 'gallons' },
    pricing: {
      price: co.price,
      currency,
      pricePerUnit: co.volume.amount > 0 ? co.price / co.volume.amount : undefined,
    },
    delivery: (bid as any).deliveryDate || (bid as any).deliveryLocation
      ? {
          deliveryDate: (bid as any).deliveryDate ? new Date((bid as any).deliveryDate) : undefined,
          deliveryLocation: (bid as any).deliveryLocation,
        }
      : lot.delivery,
    compliance: lot.compliance,
    status: 'pending_signature',
    terms: co.message,
  })

  await Lot.findByIdAndUpdate(lot._id, { status: 'sold' })
  ;(bid as any).status = 'accepted'
  ;(bid as any).respondedAt = new Date()
  await bid.save()

  return contract
}

/**
 * Get contracts for user's organization
 */
export async function getUserContracts(userId: string, filters?: { status?: ContractStatus }) {
  await connectDB()
  const orgId = await resolveUserOrgId(userId)
  if (!orgId) {
    return []
  }

  const query: any = {
    $or: [
      { sellerOrgId: new Types.ObjectId(orgId) },
      { buyerOrgId: new Types.ObjectId(orgId) },
    ],
  }

  if (filters?.status) {
    query.status = filters.status
  }

  const contracts = await Contract.find(query)
    .populate('lotId', 'title volume pricing')
    .populate('bidId', 'bidderName bidderEmail')
    .populate('sellerOrgId', 'name branding')
    .populate('buyerOrgId', 'name branding')
    .sort({ createdAt: -1 })
    .lean()

  return contracts
}

/**
 * Get contract by ID
 */
export async function getContractById(contractId: string) {
  await connectDB()
  return await Contract.findById(contractId)
    .populate('lotId', 'title volume pricing')
    .populate('bidId', 'bidderName bidderEmail')
    .populate('sellerOrgId', 'name branding')
    .populate('buyerOrgId', 'name branding')
    .lean()
}

/**
 * Update contract status
 */
export async function updateContractStatus(
  contractId: string,
  userId: string,
  status: ContractStatus,
  additionalData?: { signedBy?: string }
) {
  await connectDB()
  const contract = await Contract.findById(contractId)
  if (!contract) {
    throw new Error('Contract not found')
  }

  // Verify user has access to this contract
  const orgId = await resolveUserOrgId(userId)
  if (!orgId) {
    throw new Error('No organization membership found')
  }

  const isSeller = contract.sellerOrgId.toString() === orgId
  const isBuyer = contract.buyerOrgId && contract.buyerOrgId.toString() === orgId

  if (!isSeller && !isBuyer) {
    throw new Error('Unauthorized: You do not have access to this contract')
  }

  // Update status
  contract.status = status

  if (status === 'signed') {
    contract.signedAt = new Date()
    if (additionalData?.signedBy) {
      if (isSeller) {
        contract.signedBySeller = new Types.ObjectId(additionalData.signedBy)
      } else if (isBuyer) {
        contract.signedByBuyer = new Types.ObjectId(additionalData.signedBy)
      }
    }
  }

  if (status === 'completed') {
    contract.completedAt = new Date()
  }

  await contract.save()
  return contract
}



