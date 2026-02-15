import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    // *** ШИНЭ: Байгууллагын ID ***
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true, // Хурдан хайлт хийхэд тустай
    },

    phone: { type: String, required: true },
    name: { type: String, default: null },

    // Нэмэлт мэдээлэл
    email: { type: String },
    address: { type: String },

    total_bonus: { type: Number, default: 0 },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Сүүлд үйлчлүүлсэн огноо
    lastVisit: { type: Date },

    // Идэвхитэй эсэх
    isActive: { type: Boolean, default: true },

    // Тэмдэглэл
    notes: { type: String },
  },
  { timestamps: true },
);

// *** ЧУХАЛ: Compound unique index ***
// Утасны дугаар нь зөвхөн тухайн газар дотор уникаль байх ёстой
customerSchema.index({ organizationId: 1, phone: 1 }, { unique: true });

// Бонусоор хайх
customerSchema.index({ organizationId: 1, total_bonus: -1 });

// Сүүлд үйлчлүүлсэн огноогоор хайх
customerSchema.index({ organizationId: 1, lastVisit: -1 });

export default mongoose.model("Customer", customerSchema);
