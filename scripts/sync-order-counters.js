/**
 * Байгаа захиалгуудын сүүлийн дугаарыг counters collection-д sync хийх.
 * Шинэ Counter model руу шилжихийн өмнө нэг удаа ажиллуулна.
 * Usage: node scripts/sync-order-counters.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

const counterSchema = new mongoose.Schema({
  _id: String,
  seq: { type: Number, default: 0 },
});
const Counter = mongoose.model("Counter", counterSchema);

const orderSchema = new mongoose.Schema({
  organizationId: mongoose.Schema.Types.ObjectId,
  orderNumber: String,
  isDeleted: Boolean,
});
const Order = mongoose.model("Order", orderSchema);

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const orgs = await Order.distinct("organizationId");
  console.log(`Found ${orgs.length} organization(s)`);

  for (const orgId of orgs) {
    const lastOrder = await Order.findOne({
      organizationId: orgId,
      isDeleted: { $ne: true },
    })
      .sort({ createdAt: -1 })
      .select("orderNumber");

    if (!lastOrder?.orderNumber) continue;

    const lastNum = parseInt(lastOrder.orderNumber.split("-")[1] || "0");
    if (isNaN(lastNum)) continue;

    await Counter.findOneAndUpdate(
      { _id: `orderNumber:${orgId}` },
      { $max: { seq: lastNum } },
      { upsert: true }
    );
    console.log(`org ${orgId}: counter set to ${lastNum}`);
  }

  await mongoose.disconnect();
  console.log("Done.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
