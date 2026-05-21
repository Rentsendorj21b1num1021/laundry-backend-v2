import mongoose, { type Document, type Model } from 'mongoose'

export interface IUserOrganization {
  organizationId: mongoose.Types.ObjectId
  role: 'owner' | 'manager' | 'employee'
  permissions: string[]
  joinedAt: Date
  isActive: boolean
}

export interface IUser {
  username: string
  passwordHash: string
  phone: string
  email: string
  role: 'super_admin' | 'owner' | 'manager' | 'employee'
  organizations: IUserOrganization[]
  defaultOrganization?: mongoose.Types.ObjectId
  avatarUrl: string
  lastLoginAt?: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UserDocument extends IUser, Document {}

const userSchema = new mongoose.Schema<UserDocument>(
  {
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['super_admin', 'owner', 'manager', 'employee'], default: 'employee' },
    organizations: [
      {
        organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
        role: { type: String, enum: ['owner', 'manager', 'employee'], default: 'employee' },
        permissions: [String],
        joinedAt: { type: Date, default: Date.now },
        isActive: { type: Boolean, default: true }
      }
    ],
    defaultOrganization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    avatarUrl: { type: String, default: '' },
    lastLoginAt: { type: Date },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
)

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (ret as any).passwordHash
    return ret
  }
})

userSchema.index({ 'organizations.organizationId': 1 })

export const User: Model<UserDocument> = mongoose.model<UserDocument>('User', userSchema)
