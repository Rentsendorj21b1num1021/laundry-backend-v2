const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  parentId: { type: String },
});

const CategorySchema = new mongoose.Schema({
  id: { type: String, required: true },
  category: { type: String, required: true },
  items: [ItemSchema],
});

const MenuSchema = new mongoose.Schema(
  {
    service: { type: String, required: true },
    categories: [CategorySchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Menu", MenuSchema);
