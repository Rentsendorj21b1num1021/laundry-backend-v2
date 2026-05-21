import mongoose, { type Document, type Model } from 'mongoose'

export interface IOrderItem {
  id: string
  name: string
  price: number
  quantity: number
  parentId?: string
}

export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED'
export type PaymentMethod = 'cash' | 'card' | 'qpay' | 'monpay' | 'hipay' | 'bonus'

export interface IOrder {
  organizationId: mongoose.Types.ObjectId
  orderNumber: string
  customer_id?: mongoose.Types.ObjectId
  employee_id: mongoose.Types.ObjectId
  items: IOrderItem[]
  total_price: number
  used_bonus: number
  earned_bonus: number
  status: OrderStatus
  paymentMethod?: PaymentMethod
  paidAmount?: number
  changeAmount: number
  notes?: string
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
}

export interface OrderDocument extends IOrder, Document {}

const orderSchema = new mongoose.Schema<OrderDocument>(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    orderNumber: { type: String, required: true },
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: false },
    employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        id: String,
        name: String,
        price: Number,
        quantity: { type: Number, default: 1 },
        parentId: String
      }
    ],
    total_price: { type: Number, required: true },
    used_bonus: { type: Number, default: 0 },
    earned_bonus: { type: Number, default: 0 },
    status: { type: String, enum: ['PENDING', 'PAID', 'CANCELLED', 'REFUNDED'], default: 'PAID' },
    paymentMethod: { type: String, enum: ['cash', 'card', 'qpay', 'monpay', 'hipay', 'bonus'] },
    paidAmount: { type: Number },
    changeAmount: { type: Number, default: 0 },
    notes: { type: String },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
)

orderSchema.index({ organizationId: 1, createdAt: -1 })
orderSchema.index({ organizationId: 1, orderNumber: 1 }, { unique: true })
orderSchema.index({ organizationId: 1, customer_id: 1 })
orderSchema.index({ organizationId: 1, employee_id: 1 })
orderSchema.index({ organizationId: 1, status: 1 })

export const Order: Model<OrderDocument> = mongoose.model<OrderDocument>('Order', orderSchema)
