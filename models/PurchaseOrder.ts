import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface IOrderVolume {
  amount?: number
  unit?: string
}

export interface IPurchaseOrder extends Document {
  orgId: Types.ObjectId
  poNumber: string
  supplierName?: string
  orderDate?: Date
  deliveryDate?: Date
  volumeOrdered?: IOrderVolume
  createdBy?: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const OrderVolumeSchema = new Schema<IOrderVolume>(
  {
    amount: { type: Number },
    unit: { type: String, trim: true },
  },
  { _id: false }
)

const PurchaseOrderSchema: Schema<IPurchaseOrder> = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    poNumber: { type: String, required: true, trim: true },
    supplierName: { type: String, trim: true },
    orderDate: { type: Date },
    deliveryDate: { type: Date },
    volumeOrdered: { type: OrderVolumeSchema, default: undefined },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
)

PurchaseOrderSchema.index({ orgId: 1, poNumber: 1 }, { unique: true })

const PurchaseOrder: Model<IPurchaseOrder> =
  mongoose.models.PurchaseOrder || mongoose.model<IPurchaseOrder>('PurchaseOrder', PurchaseOrderSchema)

export default PurchaseOrder



















