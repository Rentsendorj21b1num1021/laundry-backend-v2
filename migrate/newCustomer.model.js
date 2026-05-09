import mongoose from "mongoose";

const newCustomerSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    phone: { type: String, required: true },
    name: String,
    email: String,
    address: String,
    total_bonus: { type: Number, default: 0 },
    createdBy: mongoose.Schema.Types.ObjectId,
    lastVisit: Date,
    isActive: { type: Boolean, default: true },
    notes: String,
  },
  { timestamps: true },
);

newCustomerSchema.index({ organizationId: 1, phone: 1 }, { unique: true });

export default newCustomerSchema; // ⬅️ ЗӨВ
