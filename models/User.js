import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },

    // Үндсэн роль (системийн хэмжээнд)
    role: {
      type: String,
      enum: ["super_admin", "owner", "manager", "employee"],
      default: "employee",
    },

    // Олон байгууллагад ажиллах боломж
    organizations: [
      {
        organizationId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Organization",
          required: true,
        },

        // Тухайн газар дахь роль
        role: {
          type: String,
          enum: ["owner", "manager", "employee"],
          default: "employee",
        },

        // Нэмэлт эрхүүд (хэрэв шаардлагатай бол)
        permissions: [String],

        // Ажилд орсон огноо
        joinedAt: { type: Date, default: Date.now },

        // Идэвхитэй эсэх
        isActive: { type: Boolean, default: true },
      },
    ],

    // Анхдагч байгууллага (нэвтрэх үед автоматаар сонгогдоно)
    defaultOrganization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },

    avatarUrl: { type: String, default: "" },

    // Сүүлд нэвтэрсэн
    lastLoginAt: { type: Date },

    // Идэвхитэй эсэх
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// JSON буцаахдаа passwordHash-г арилгах
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.passwordHash;
    return ret;
  },
});

// Index
userSchema.index({ "organizations.organizationId": 1 });

export default mongoose.model("User", userSchema);
