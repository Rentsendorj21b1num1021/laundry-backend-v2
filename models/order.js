import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    // *** ШИНЭ: Байгууллагын ID ***
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    // Захиалгын дугаар (газар бүрт өөр формат байж болно)
    // Жишээ: BZ-0001, SH-0001
    orderNumber: {
      type: String,
      required: true,
    },

    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: false,
    },

    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        id: String,
        name: String,
        price: Number,
        quantity: { type: Number, default: 1 },
        parentId: String,
      },
    ],

    total_price: {
      type: Number,
      required: true,
    },

    used_bonus: {
      type: Number,
      default: 0,
    },

    earned_bonus: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["PENDING", "PAID", "CANCELLED", "REFUNDED"],
      default: "PAID",
    },

    // Төлбөрийн мэдээлэл
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "qpay", "monpay", "hipay", "bonus"],
    },

    // Төлсөн дүн
    paidAmount: { type: Number },

    // Хариу өгөх мөнгө
    changeAmount: { type: Number, default: 0 },

    // Тэмдэглэл
    notes: { type: String },
  },
  { timestamps: true },
);

// Index - Хурдан хайлт хийхэд чухал
orderSchema.index({ organizationId: 1, createdAt: -1 });
orderSchema.index({ organizationId: 1, orderNumber: 1 }, { unique: true });
orderSchema.index({ organizationId: 1, customer_id: 1 });
orderSchema.index({ organizationId: 1, employee_id: 1 });
orderSchema.index({ organizationId: 1, status: 1 });

export default mongoose.model("Order", orderSchema);
