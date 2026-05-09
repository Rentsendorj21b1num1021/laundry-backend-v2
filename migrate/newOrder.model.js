import mongoose from "mongoose";

const newOrderSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    orderNumber: { type: String, required: true },
    customer_id: mongoose.Schema.Types.ObjectId,
    employee_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    items: [
      {
        id: String,
        name: String,
        price: Number,
        quantity: { type: Number, default: 1 },
        parentId: String,
      },
    ],
    total_price: { type: Number, required: true },
    used_bonus: { type: Number, default: 0 },
    earned_bonus: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["PENDING", "PAID", "CANCELLED", "REFUNDED"],
      default: "PAID",
    },
    paymentMethod: String,
    paidAmount: Number,
    changeAmount: { type: Number, default: 0 },
    notes: String,
  },
  { timestamps: true },
);

newOrderSchema.index({ organizationId: 1, orderNumber: 1 }, { unique: true });

export default newOrderSchema;
