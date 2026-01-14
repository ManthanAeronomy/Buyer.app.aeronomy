import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export type BidStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'expired'

export interface IBidVolume {
  amount: number
  unit: string // e.g., 'gallons', 'liters', 'metric-tons'
}

export interface IBidPricing {
  price: number
  currency: string // e.g., 'USD', 'EUR', 'GBP'
  pricePerUnit?: number
  paymentTerms?: string
}

export interface IBid extends Document {
  // Lot reference
  lotId: Types.ObjectId // Reference to the Lot
  
  // Bidder information
  bidderId: Types.ObjectId // MongoDB User who placed the bid (reference to User)
  bidderName?: string // Bidder organization/company name (for display/backward compatibility)
  bidderEmail?: string // Bidder contact email (for display/backward compatibility)
  
  // Bid details
  volume: IBidVolume // Volume being bid for
  pricing: IBidPricing // Bid price
  status: BidStatus
  
  // Additional information
  message?: string // Optional message from bidder
  deliveryDate?: Date // Proposed delivery date
  deliveryLocation?: string
  
  // Metadata
  source?: string // Source system (e.g., 'port-3004', 'api')
  externalBidId?: string // External bid ID if coming from another system
  
  // Dates
  expiresAt?: Date
  respondedAt?: Date
  
  createdAt: Date
  updatedAt: Date
}

const BidVolumeSchema = new Schema<IBidVolume>(
  {
    amount: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, trim: true },
  },
  { _id: false }
)

const BidPricingSchema = new Schema<IBidPricing>(
  {
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, trim: true, default: 'USD' },
    pricePerUnit: { type: Number },
    paymentTerms: { type: String, trim: true },
  },
  { _id: false }
)

const BidSchema: Schema<IBid> = new Schema(
  {
    lotId: { type: Schema.Types.ObjectId, ref: 'Lot', required: true, index: true },
    bidderId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }, // MongoDB User reference
    bidderName: { type: String, trim: true }, // For display/backward compatibility
    bidderEmail: { type: String, trim: true, lowercase: true }, // For display/backward compatibility
    volume: { type: BidVolumeSchema, required: true },
    pricing: { type: BidPricingSchema, required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'withdrawn', 'expired'],
      required: true,
      default: 'pending',
      index: true,
    },
    message: { type: String, trim: true },
    deliveryDate: { type: Date },
    deliveryLocation: { type: String, trim: true },
    source: { type: String, trim: true, default: 'port-3004' },
    externalBidId: { type: String, trim: true, index: true },
    expiresAt: { type: Date, index: true },
    respondedAt: { type: Date },
  },
  {
    timestamps: true,
  }
)

// Indexes for efficient queries
BidSchema.index({ lotId: 1, status: 1 })
BidSchema.index({ bidderId: 1, status: 1 })
BidSchema.index({ createdAt: -1 })
BidSchema.index({ lotId: 1, createdAt: -1 })

// Calculate price per unit before saving
BidSchema.pre('save', function (next) {
  if (this.pricing && this.volume && this.volume.amount > 0) {
    if (this.pricing.pricePerUnit !== undefined && this.pricing.pricePerUnit !== null) {
      this.pricing.price = this.pricing.pricePerUnit * this.volume.amount
    } else if (this.pricing.price !== undefined && this.pricing.price !== null) {
      this.pricing.pricePerUnit = this.pricing.price / this.volume.amount
    }
  }
  next()
})

const Bid: Model<IBid> = mongoose.models.Bid || mongoose.model<IBid>('Bid', BidSchema)

export default Bid



