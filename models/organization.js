import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Бизнесийн төрөл (угаалга, кафе гэх мэт)
    businessType: {
      type: String,
      default: "laundry",
    },

    // Холбоо барих мэдээлэл
    address: { type: String },
    phone: { type: String },
    email: { type: String },

    // Бизнесийн тохиргоо
    bonusPercentage: {
      type: Number,
      default: 0.05, // 5% бонус
      min: 0,
      max: 1,
    },

    currency: {
      type: String,
      default: "MNT",
    },

    // Идэвхитэй эсэх
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },

    // Захиалгын дугаарын өмнөх үсэг (жишээ: BZ-001, SH-001)
    orderPrefix: {
      type: String,
      maxlength: 3,
    },

    // Эзэмшигч
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Subscription мэдээлэл (хэрэв төлбөртэй болговол)
    subscriptionPlan: {
      type: String,
      enum: ["free", "basic", "premium"],
      default: "free",
    },

    subscriptionExpiry: { type: Date },

    // Тохиргоо
    settings: {
      // Нээх цаг
      workingHours: {
        start: { type: String, default: "09:00" },
        end: { type: String, default: "18:00" },
      },

      // Амралтын өдрүүд
      closedDays: [{ type: Number, min: 0, max: 6 }], // 0 = Ням, 1 = Даваа

      // Төлбөрийн хэрэгсэл
      paymentMethods: [
        {
          type: String,
          enum: ["cash", "card", "qpay", "monpay", "hipay"],
        },
      ],

      // Захиалгын автомат баталгаажуулалт
      autoConfirmOrders: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
);

// Index
organizationSchema.index({ ownerId: 1 });
organizationSchema.index({ status: 1 });

export default mongoose.model("Organization", organizationSchema);
