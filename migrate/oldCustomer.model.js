import mongoose from "mongoose";

const oldCustomerSchema = new mongoose.Schema(
  {
    phone: String,
    name: String,
    total_bonus: Number,
    createdBy: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: true },
);

export default oldCustomerSchema; // ⬅️ ЗӨВ
