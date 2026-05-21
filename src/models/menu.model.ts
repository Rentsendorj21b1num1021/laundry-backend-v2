import mongoose, { type Document, type Model } from 'mongoose'

export interface IMenuItem {
  id: string
  name: string
  price: number
  parentId?: string
  description?: string
  duration?: number
  isAvailable: boolean
}

export interface IMenuCategory {
  id: string
  category: string
  items: IMenuItem[]
  order: number
}

export interface IMenu {
  organizationId: mongoose.Types.ObjectId
  service: string
  categories: IMenuCategory[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface MenuDocument extends IMenu, Document {}

const ItemSchema = new mongoose.Schema<IMenuItem>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  parentId: { type: String },
  description: { type: String },
  duration: { type: Number },
  isAvailable: { type: Boolean, default: true }
})

const CategorySchema = new mongoose.Schema<IMenuCategory>({
  id: { type: String, required: true },
  category: { type: String, required: true },
  items: [ItemSchema],
  order: { type: Number, default: 0 }
})

const menuSchema = new mongoose.Schema<MenuDocument>(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    service: { type: String, required: true },
    categories: [CategorySchema],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
)

menuSchema.index({ organizationId: 1, service: 1 }, { unique: true })

export const Menu: Model<MenuDocument> = mongoose.model<MenuDocument>('Menu', menuSchema)
