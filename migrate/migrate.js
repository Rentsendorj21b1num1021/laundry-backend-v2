// migrate.js
// Хуучин DB-с шинэ DB руу customers болон orders collection зөөнө
import mongoose from "mongoose";
import oldCustomerSchema from "./oldCustomer.model.js";
import newCustomerSchema from "./newCustomer.model.js";
import oldOrderSchema from "./oldOrder.model.js";
import newOrderSchema from "./newOrder.model.js";

const ORGANIZATION_ID = new mongoose.Types.ObjectId("69ff332b85802abf1e74ee64");

async function migrate() {
  const oldConn = await mongoose
    .createConnection(
      `mongodb+srv://rentsendorjbatmunkh1_db_user:Ree%400814@laundrydb.sjcstnd.mongodb.net/?appName=laundryDb`,
    )
    .asPromise();
  console.log(`✅ Connected to OLD db: laundryDb`);

  const newConn = await mongoose
    .createConnection(
      `mongodb+srv://rentsendorjbatmunkh1_db_user:Ree%400814@cluster.8zd4s1k.mongodb.net/prod?appName=Cluster`,
    )
    .asPromise();
  console.log(`✅ Connected to NEW db: prod`);

  const OldCustomer = oldConn.model(
    "OldCustomer",
    oldCustomerSchema,
    "customers",
  );
  const NewCustomer = newConn.model("Customer", newCustomerSchema, "customers");

  const customers = await OldCustomer.find().lean();

  let inserted = 0;
  let skipped = 0;

  for (const c of customers) {
    const exists = await NewCustomer.findOne({ phone: c.phone });
    if (exists) {
      skipped++;
      continue;
    }

    await NewCustomer.create({
      _id: c._id,
      phone: c.phone,
      name: c.name,
      email: c.email,
      address: c.address,
      total_bonus: c.total_bonus ?? 0,
      createdBy: c.createdBy,
      lastVisit: c.updatedAt,
      isActive: true,
      organizationId: ORGANIZATION_ID,
      notes: "Migrated from laundryDb",
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    });

    inserted++;
  }

  console.log(`✅ Customers — Inserted: ${inserted}, Skipped: ${skipped}`);

  // ── Orders migration ──────────────────────────────────────────
  const OldOrder = oldConn.model("OldOrder", oldOrderSchema, "orders");
  const NewOrder = newConn.model("Order", newOrderSchema, "orders");

  const orders = await OldOrder.find().lean();
  console.log(`Found ${orders.length} orders`);

  let oInserted = 0;
  let oSkipped = 0;
  let counter = 1;

  for (const o of orders) {
    const exists = await NewOrder.findOne({ _id: o._id });
    if (exists) {
      oSkipped++;
      counter++;
      continue;
    }

    const orderNumber = `MIG-${String(counter).padStart(4, "0")}`;

    await NewOrder.create({
      _id: o._id,
      organizationId: ORGANIZATION_ID,
      orderNumber,
      customer_id: o.customer_id,
      employee_id: o.employee_id,
      items: o.items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        parentId: item.parentId,
      })),
      total_price: o.total_price,
      used_bonus: o.used_bonus ?? 0,
      earned_bonus: o.earned_bonus ?? 0,
      status: o.status ?? "PAID",
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    });

    oInserted++;
    counter++;
  }

  console.log(`✅ Orders — Inserted: ${oInserted}, Skipped: ${oSkipped}`);

  await oldConn.close();
  await newConn.close();
  process.exit(0);
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
