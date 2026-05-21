import mongoose, { type Document, type Model } from 'mongoose'

export interface ICustomer {
  organizationId: mongoose.Types.ObjectId
  phone: string
  name?: string | null
  email?: string
  address?: string
  total_bonus: number
  createdBy?: mongoose.Types.ObjectId
  lastVisit?: Date
  isActive: boolean
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface CustomerDocument extends ICustomer, Document {}

const customerSchema = new mongoose.Schema<CustomerDocument>(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    phone: { type: String, required: true },
    name: { type: String, default: null },
    email: { type: String },
    address: { type: String },
    total_bonus: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastVisit: { type: Date },
    isActive: { type: Boolean, default: true },
    notes: { type: String }
  },
  { timestamps: true }
)

customerSchema.index({ organizationId: 1, phone: 1 }, { unique: true })
customerSchema.index({ organizationId: 1, total_bonus: -1 })
customerSchema.index({ organizationId: 1, lastVisit: -1 })

export const Customer: Model<CustomerDocument> = mongoose.model<CustomerDocument>('Customer', customerSchema)
