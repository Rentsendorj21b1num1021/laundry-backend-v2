import mongoose, { type Document, type Model } from 'mongoose'

export interface IOrganization {
  name: string
  businessType: string
  address?: string
  phone?: string
  email?: string
  bonusPercentage: number
  currency: string
  status: 'active' | 'inactive' | 'suspended'
  orderPrefix?: string
  ownerId: mongoose.Types.ObjectId
  subscriptionPlan: 'free' | 'basic' | 'premium'
  subscriptionExpiry?: Date
  settings: {
    workingHours: { start: string; end: string }
    closedDays: number[]
    paymentMethods: Array<'cash' | 'card' | 'qpay' | 'monpay' | 'hipay'>
    autoConfirmOrders: boolean
    printReceipts: boolean
  }
  createdAt: Date
  updatedAt: Date
}

export interface OrganizationDocument extends IOrganization, Document {}

const organizationSchema = new mongoose.Schema<OrganizationDocument>(
  {
    name: { type: String, required: true, trim: true },
    businessType: { type: String, default: 'laundry' },
    address: { type: String },
    phone: { type: String },
    email: { type: String },
    bonusPercentage: { type: Number, default: 0.05, min: 0, max: 1 },
    currency: { type: String, default: 'MNT' },
    status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
    orderPrefix: { type: String, maxlength: 3 },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subscriptionPlan: { type: String, enum: ['free', 'basic', 'premium'], default: 'free' },
    subscriptionExpiry: { type: Date },
    settings: {
      workingHours: {
        start: { type: String, default: '09:00' },
        end: { type: String, default: '18:00' }
      },
      closedDays: [{ type: Number, min: 0, max: 6 }],
      paymentMethods: [{ type: String, enum: ['cash', 'card', 'qpay', 'monpay', 'hipay'] }],
      autoConfirmOrders: { type: Boolean, default: true },
      printReceipts: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
)

organizationSchema.index({ ownerId: 1 })
organizationSchema.index({ status: 1 })

export const Organization: Model<OrganizationDocument> = mongoose.model<OrganizationDocument>('Organization', organizationSchema)
