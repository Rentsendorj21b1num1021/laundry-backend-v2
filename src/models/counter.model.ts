import mongoose, { type Document, type Model } from 'mongoose'

export interface CounterDocument extends Omit<Document, '_id'> {
  _id: string
  seq: number
}

const counterSchema = new mongoose.Schema<CounterDocument>({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
})

export const Counter: Model<CounterDocument> = mongoose.model<CounterDocument>('Counter', counterSchema)
