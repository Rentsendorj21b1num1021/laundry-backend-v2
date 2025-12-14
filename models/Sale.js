import mongoose from "mongoose";

const saleSchema = new mongoose.Schema(
  {
    employee_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    total_amount: { type: Number, required: true },
    bonus_amount: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Sale", saleSchema);
