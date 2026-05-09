import mongoose from "mongoose";

const oldOrderSchema = new mongoose.Schema(
  {
    customer_id: mongoose.Schema.Types.ObjectId,
    employee_id: mongoose.Schema.Types.ObjectId,
    items: [
      {
        id: String,
        name: String,
        price: Number,
        parentId: String,
      },
    ],
    total_price: Number,
    used_bonus: { type: Number, default: 0 },
    earned_bonus: { type: Number, default: 0 },
    status: String,
  },
  { timestamps: true },
);

export default oldOrderSchema;
