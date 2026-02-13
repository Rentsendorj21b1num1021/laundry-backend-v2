import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true },
    name: { type: String, default: null },   
    total_bonus: { type: Number, default: 0 }, 
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" }, 
  },
  { timestamps: true }
);

export default mongoose.model("Customer", customerSchema);
