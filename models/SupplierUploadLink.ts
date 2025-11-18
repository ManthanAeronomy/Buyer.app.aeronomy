import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface ISupplierUploadLink extends Document {
  orgId: Types.ObjectId
  supplierName: string
  poId?: Types.ObjectId
  token: string
  expiresAt?: Date
  used: boolean
  createdAt: Date
  updatedAt: Date
}

const SupplierUploadLinkSchema: Schema<ISupplierUploadLink> = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    supplierName: { type: String, required: true, trim: true },
    poId: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder' },
    token: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, index: true },
    used: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
)

SupplierUploadLinkSchema.index({ orgId: 1, supplierName: 1 })

const SupplierUploadLink: Model<ISupplierUploadLink> =
  mongoose.models.SupplierUploadLink ||
  mongoose.model<ISupplierUploadLink>('SupplierUploadLink', SupplierUploadLinkSchema)

export default SupplierUploadLink









