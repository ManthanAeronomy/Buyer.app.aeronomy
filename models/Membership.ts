import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export type MembershipRole = 'admin' | 'compliance' | 'buyer' | 'finance' | 'viewer'

export interface IMembership extends Document {
  orgId: Types.ObjectId
  userId: string
  role: MembershipRole
  createdAt: Date
  updatedAt: Date
}

const MembershipSchema: Schema<IMembership> = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    userId: { type: String, required: true, index: true },
    role: {
      type: String,
      enum: ['admin', 'compliance', 'buyer', 'finance', 'viewer'],
      required: true,
      default: 'viewer',
    },
  },
  {
    timestamps: true,
  }
)

MembershipSchema.index({ orgId: 1, userId: 1 }, { unique: true })

if (mongoose.models.Membership) {
  mongoose.deleteModel('Membership')
}

const Membership: Model<IMembership> = mongoose.model<IMembership>('Membership', MembershipSchema)

export default Membership

