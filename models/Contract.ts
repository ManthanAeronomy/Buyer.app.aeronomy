import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export type ContractStatus = 'draft' | 'pending_signature' | 'signed' | 'active' | 'completed' | 'cancelled'

export interface IContractVolume {
  amount: number
  unit: string // e.g., 'gallons', 'liters', 'metric-tons'
}

export interface IContractPricing {
  price: number
  currency: string
  pricePerUnit?: number
  paymentTerms?: string
}

export interface IContractDelivery {
  deliveryDate?: Date
  deliveryLocation?: string
  deliveryMethod?: string
  incoterms?: string
}

export interface IContract extends Document {
  // References
  lotId: Types.ObjectId // Reference to the original Lot
  bidId: Types.ObjectId // Reference to the accepted Bid
  
  // Parties
  sellerOrgId: Types.ObjectId // Organization selling (lot owner)
  buyerOrgId?: Types.ObjectId // Organization buying (bidder)
  buyerName?: string // Buyer organization name
  buyerEmail?: string // Buyer contact email
  
  // Contract details
  contractNumber: string // Unique contract number
  title: string
  description?: string
  
  // Volume and pricing (from bid)
  volume: IContractVolume
  pricing: IContractPricing
  
  // Delivery information
  delivery?: IContractDelivery
  
  // Compliance
  compliance?: {
    standards?: string[]
    certificates?: Types.ObjectId[]
  }
  
  // Status and dates
  status: ContractStatus
  signedAt?: Date
  signedBySeller?: Types.ObjectId // MongoDB User who signed as seller (reference to User)
  signedByBuyer?: Types.ObjectId // MongoDB User who signed as buyer (reference to User)
  completedAt?: Date
  
  // Contract terms
  terms?: string // Additional contract terms
  attachments?: string[] // URLs to contract documents
  
  // Metadata
  createdAt: Date
  updatedAt: Date
}

const ContractVolumeSchema = new Schema<IContractVolume>(
  {
    amount: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, trim: true },
  },
  { _id: false }
)

const ContractPricingSchema = new Schema<IContractPricing>(
  {
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, trim: true, default: 'USD' },
    pricePerUnit: { type: Number },
    paymentTerms: { type: String, trim: true },
  },
  { _id: false }
)

const ContractDeliverySchema = new Schema<IContractDelivery>(
  {
    deliveryDate: { type: Date },
    deliveryLocation: { type: String, trim: true },
    deliveryMethod: { type: String, trim: true },
    incoterms: { type: String, trim: true },
  },
  { _id: false }
)

const ContractSchema: Schema<IContract> = new Schema(
  {
    lotId: { type: Schema.Types.ObjectId, ref: 'Lot', required: true, index: true },
    bidId: { type: Schema.Types.ObjectId, ref: 'Bid', required: true, index: true },
    sellerOrgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    buyerOrgId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
    buyerName: { type: String, trim: true },
    buyerEmail: { type: String, trim: true, lowercase: true },
    contractNumber: { type: String, required: true, unique: true, trim: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    volume: { type: ContractVolumeSchema, required: true },
    pricing: { type: ContractPricingSchema, required: true },
    delivery: { type: ContractDeliverySchema },
    compliance: {
      standards: [{ type: String, trim: true }],
      certificates: [{ type: Schema.Types.ObjectId, ref: 'Certificate' }],
    },
    status: {
      type: String,
      enum: ['draft', 'pending_signature', 'signed', 'active', 'completed', 'cancelled'],
      required: true,
      default: 'draft',
      index: true,
    },
    signedAt: { type: Date },
    signedBySeller: { type: Schema.Types.ObjectId, ref: 'User' }, // MongoDB User reference
    signedByBuyer: { type: Schema.Types.ObjectId, ref: 'User' }, // MongoDB User reference
    completedAt: { type: Date },
    terms: { type: String, trim: true },
    attachments: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
  }
)

// Indexes for efficient queries
ContractSchema.index({ sellerOrgId: 1, status: 1 })
ContractSchema.index({ buyerOrgId: 1, status: 1 })
ContractSchema.index({ lotId: 1 })
ContractSchema.index({ bidId: 1 })
ContractSchema.index({ contractNumber: 1 })
ContractSchema.index({ createdAt: -1 })

// Generate contract number before saving
ContractSchema.pre('save', async function (next) {
  if (!this.contractNumber) {
    const year = new Date().getFullYear()
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    this.contractNumber = `CNT-${year}-${random}`
  }
  next()
})

const Contract: Model<IContract> = mongoose.models.Contract || mongoose.model<IContract>('Contract', ContractSchema)

export default Contract



