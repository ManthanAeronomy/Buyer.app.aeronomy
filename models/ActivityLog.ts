import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export type ActivityActorType = 'user' | 'supplier' | 'system'
export type ActivityAction =
  | 'uploaded'
  | 'validated'
  | 'linked'
  | 'generated_report'
  | 'role_changed'
  | string

export interface IActivityEntity {
  type: 'certificate' | 'po' | 'user' | 'org' | 'report' | string
  id: Types.ObjectId | string
}

export interface IActivityLog extends Document {
  orgId: Types.ObjectId
  userId?: Types.ObjectId
  actorType: ActivityActorType
  action: ActivityAction
  entity?: IActivityEntity
  details?: Record<string, any>
  ip?: string
  ua?: string
  createdAt: Date
  updatedAt: Date
}

const ActivityEntitySchema = new Schema<IActivityEntity>(
  {
    type: { type: String, required: true, trim: true },
    id: { type: Schema.Types.Mixed, required: true },
  },
  { _id: false }
)

const ActivityLogSchema: Schema<IActivityLog> = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    actorType: { type: String, enum: ['user', 'supplier', 'system'], required: true },
    action: { type: String, required: true, trim: true },
    entity: { type: ActivityEntitySchema, default: undefined },
    details: { type: Schema.Types.Mixed, default: undefined },
    ip: { type: String, trim: true },
    ua: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
)

ActivityLogSchema.index({ orgId: 1, createdAt: -1 })
ActivityLogSchema.index({ 'entity.type': 1, 'entity.id': 1 })

const ActivityLog: Model<IActivityLog> =
  mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema)

export default ActivityLog



















