import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
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
      enum: ["PAID", "CANCELLED"],
      default: "PAID",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
