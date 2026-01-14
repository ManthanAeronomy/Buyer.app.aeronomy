import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export type LotStatus = 'draft' | 'published' | 'reserved' | 'sold' | 'cancelled'
export type LotType = 'spot' | 'forward' | 'contract'

export interface ILotVolume {
  amount: number
  unit: string // e.g., 'gallons', 'liters', 'metric-tons'
}

export interface ILotPricing {
  price: number
  currency: string // e.g., 'USD', 'EUR', 'GBP'
  pricePerUnit?: number // Calculated price per unit
  paymentTerms?: string
}

export interface ILotDelivery {
  deliveryDate?: Date
  deliveryLocation?: string
  deliveryMethod?: string
  incoterms?: string
}

export interface ILotCompliance {
  certificates?: Types.ObjectId[] // References to Certificate documents
  standards?: string[] // e.g., ['ISCC', 'RSB', 'CORSIA']
  ghgReduction?: number // Percentage
  sustainabilityScore?: number
}

export interface ILot extends Document {
  // Organization/User info
  orgId: Types.ObjectId // Organization posting the lot (airline/supplier)
  postedBy: Types.ObjectId // MongoDB User who posted the lot (reference to User)
  airlineName?: string // Display name for the airline
  
  // Lot details
  title: string
  description?: string
  type: LotType
  status: LotStatus
  
  // Volume and pricing
  volume: ILotVolume
  pricing: ILotPricing
  
  // Delivery information
  delivery?: ILotDelivery
  
  // Compliance and certificates
  compliance?: ILotCompliance
  
  // Additional metadata
  tags?: string[]
  images?: string[] // URLs to product images
  attachments?: string[] // URLs to supporting documents
  
  // Dates
  publishedAt?: Date
  expiresAt?: Date
  reservedAt?: Date
  soldAt?: Date
  
  // Tracking
  views?: number
  inquiries?: number
  
  createdAt: Date
  updatedAt: Date
}

const LotVolumeSchema = new Schema<ILotVolume>(
  {
    amount: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, trim: true, default: 'gallons' },
  },
  { _id: false }
)

const LotPricingSchema = new Schema<ILotPricing>(
  {
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, trim: true, default: 'USD' },
    pricePerUnit: { type: Number },
    paymentTerms: { type: String, trim: true },
  },
  { _id: false }
)

const LotDeliverySchema = new Schema<ILotDelivery>(
  {
    deliveryDate: { type: Date },
    deliveryLocation: { type: String, trim: true },
    deliveryMethod: { type: String, trim: true },
    incoterms: { type: String, trim: true },
  },
  { _id: false }
)

const LotComplianceSchema = new Schema<ILotCompliance>(
  {
    certificates: [{ type: Schema.Types.ObjectId, ref: 'Certificate' }],
    standards: [{ type: String, trim: true }],
    ghgReduction: { type: Number, min: 0, max: 100 },
    sustainabilityScore: { type: Number, min: 0, max: 100 },
  },
  { _id: false }
)

const LotSchema: Schema<ILot> = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }, // MongoDB User reference
    airlineName: { type: String, trim: true },
    
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type: {
      type: String,
      enum: ['spot', 'forward', 'contract'],
      required: true,
      default: 'spot',
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'reserved', 'sold', 'cancelled'],
      required: true,
      default: 'draft',
      index: true,
    },
    
    volume: { type: LotVolumeSchema, required: true },
    pricing: { type: LotPricingSchema, required: true },
    
    delivery: { type: LotDeliverySchema, default: undefined },
    
    compliance: { type: LotComplianceSchema, default: undefined },
    
    tags: [{ type: String, trim: true }],
    images: [{ type: String, trim: true }],
    attachments: [{ type: String, trim: true }],
    
    publishedAt: { type: Date, index: true },
    expiresAt: { type: Date, index: true },
    reservedAt: { type: Date },
    soldAt: { type: Date },
    
    views: { type: Number, default: 0 },
    inquiries: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
)

// Indexes for efficient queries
LotSchema.index({ orgId: 1, status: 1 })
LotSchema.index({ status: 1, publishedAt: -1 })
LotSchema.index({ type: 1, status: 1 })
LotSchema.index({ 'compliance.standards': 1 })
LotSchema.index({ createdAt: -1 })

// Calculate price per unit or total price before saving
LotSchema.pre('save', function (next) {
  if (this.pricing && this.volume && this.volume.amount > 0) {
    // If pricePerUnit is provided, calculate total price
    if (this.pricing.pricePerUnit !== undefined && this.pricing.pricePerUnit !== null) {
      this.pricing.price = this.pricing.pricePerUnit * this.volume.amount
    } 
    // Otherwise, calculate pricePerUnit from total price (backward compatibility)
    else if (this.pricing.price !== undefined && this.pricing.price !== null) {
      this.pricing.pricePerUnit = this.pricing.price / this.volume.amount
    }
  }
  next()
})

const Lot: Model<ILot> = mongoose.models.Lot || mongoose.model<ILot>('Lot', LotSchema)

export default Lot

