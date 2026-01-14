import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface ICertificatePOLink extends Document {
  orgId: Types.ObjectId
  certificateId: Types.ObjectId
  poId: Types.ObjectId
  volumeCovered?: number
  createdAt: Date
  updatedAt: Date
}

const CertificatePOLinkSchema: Schema<ICertificatePOLink> = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    certificateId: { type: Schema.Types.ObjectId, ref: 'Certificate', required: true, index: true },
    poId: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true, index: true },
    volumeCovered: { type: Number },
  },
  {
    timestamps: true,
  }
)

CertificatePOLinkSchema.index({ certificateId: 1, poId: 1 }, { unique: true })

const CertificatePOLink: Model<ICertificatePOLink> =
  mongoose.models.CertificatePOLink ||
  mongoose.model<ICertificatePOLink>('CertificatePOLink', CertificatePOLinkSchema)

export default CertificatePOLink



















