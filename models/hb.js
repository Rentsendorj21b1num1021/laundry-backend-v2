import mongoose from 'mongoose'

const hbSchema = new mongoose.Schema({
  date: { type: String },
  notes: { type: String }
})

export default mongoose.model('hb', hbSchema)
