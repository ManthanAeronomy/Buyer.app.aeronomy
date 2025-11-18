import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export type CertificateType = 'ISCC' | 'RSB' | 'CORSIA' | 'other'
export type CertificateStatus = 'uploaded' | 'validated' | 'expiring' | 'expired' | 'invalid'
export type CertificateComplianceStatus = 'valid' | 'warning' | 'invalid'

export interface ICertificateFile {
  storageKey?: string
  url?: string
  sha256?: string
  mime?: string
  size?: number
  originalName?: string
  pages?: number
}

export interface ICertificateCompliance {
  score?: number
  status?: CertificateComplianceStatus
  issues?: string[]
}

export interface ICertificateVolume {
  amount?: number
  unit?: string
}

export interface ICertificate extends Document {
  orgId: Types.ObjectId
  supplierId?: Types.ObjectId
  type: CertificateType
  issuingBody?: string
  issueDate?: Date
  expiryDate?: Date
  volume?: ICertificateVolume
  file?: ICertificateFile
  extracted?: Record<string, any>
  status: CertificateStatus
  compliance?: ICertificateCompliance
  linkedVolume?: ICertificateVolume
  uploadedBy?: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const CertificateVolumeSchema = new Schema<ICertificateVolume>(
  {
    amount: { type: Number },
    unit: { type: String, trim: true },
  },
  { _id: false }
)

const CertificateFileSchema = new Schema<ICertificateFile>(
  {
    storageKey: { type: String, trim: true },
    url: { type: String, trim: true },
    sha256: { type: String, trim: true },
    mime: { type: String, trim: true },
    size: { type: Number },
    originalName: { type: String, trim: true },
    pages: { type: Number },
  },
  { _id: false }
)

const CertificateComplianceSchema = new Schema<ICertificateCompliance>(
  {
    score: { type: Number },
    status: { type: String, enum: ['valid', 'warning', 'invalid'], default: undefined },
    issues: { type: [String], default: undefined },
  },
  { _id: false }
)

const CertificateSchema: Schema<ICertificate> = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
    type: {
      type: String,
      enum: ['ISCC', 'RSB', 'CORSIA', 'other'],
      required: true,
      default: 'other',
    },
    issuingBody: { type: String, trim: true },
    issueDate: { type: Date },
    expiryDate: { type: Date, index: true },
    volume: { type: CertificateVolumeSchema, default: undefined },
    file: { type: CertificateFileSchema, default: undefined },
    extracted: { type: Schema.Types.Mixed, default: undefined },
    status: {
      type: String,
      enum: ['uploaded', 'validated', 'expiring', 'expired', 'invalid'],
      required: true,
      default: 'uploaded',
      index: true,
    },
    compliance: { type: CertificateComplianceSchema, default: undefined },
    linkedVolume: { type: CertificateVolumeSchema, default: undefined },
    uploadedBy: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
)

CertificateSchema.index({ orgId: 1, expiryDate: 1 })
CertificateSchema.index({ orgId: 1, status: 1 })

const Certificate: Model<ICertificate> =
  mongoose.models.Certificate || mongoose.model<ICertificate>('Certificate', CertificateSchema)

export default Certificate

