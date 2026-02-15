import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  parentId: { type: String },

  // Нэмэлт мэдээлэл
  description: { type: String },
  duration: { type: Number }, // Минутаар (хэдэн минут үргэлжлэх)
  isAvailable: { type: Boolean, default: true },
});

const CategorySchema = new mongoose.Schema({
  id: { type: String, required: true },
  category: { type: String, required: true },
  items: [ItemSchema],

  // Эрэмбэ (дэлгэцэнд хэрхэн харуулах)
  order: { type: Number, default: 0 },
});

const MenuSchema = new mongoose.Schema(
  {
    // *** ШИНЭ: Байгууллагын ID ***
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    service: { type: String, required: true },
    categories: [CategorySchema],

    // Идэвхитэй эсэх
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Газар бүр өөрийн гэсэн меню-тай байх
MenuSchema.index({ organizationId: 1, service: 1 }, { unique: true });

export default mongoose.model("Menu", MenuSchema);
