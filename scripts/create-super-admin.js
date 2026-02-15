import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/user.js";

dotenv.config();

async function createSuperAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ MongoDB холбогдлоо");

    // Super admin-ын мэдээлэл
    const superAdminData = {
      username: "Ree",
      password: "Ree@0814", // *** САЙН НУУЦ ҮГ АШИГЛААРАЙ ***
      phone: "88630310",
      email: "rentsendorjbatmunkh1@gmail.com",
    };

    // Аль хэдийн байгаа эсэхийг шалгах
    const existing = await User.findOne({
      $or: [
        { username: superAdminData.username },
        { email: superAdminData.email },
        { phone: superAdminData.phone },
      ],
    });

    if (existing) {
      console.log("❌ Super admin аль хэдийн байна:");
      console.log(`   Username: ${existing.username}`);
      console.log(`   Email: ${existing.email}`);
      process.exit(1);
    }

    // Password хаших
    const passwordHash = await bcrypt.hash(superAdminData.password, 10);

    // Super admin үүсгэх
    const superAdmin = await User.create({
      username: superAdminData.username,
      passwordHash,
      phone: superAdminData.phone,
      email: superAdminData.email,
      role: "super_admin",
      isActive: true,
      organizations: [],
      defaultOrganization: null,
    });

    console.log("\n🎉 Super admin амжилттай үүсгэгдлээ!");
    console.log("\n📋 Нэвтрэх мэдээлэл:");
    console.log(`   Username: ${superAdminData.username}`);
    console.log(`   Password: ${superAdminData.password}`);
    console.log(`   Email: ${superAdminData.email}`);
    console.log(`   Phone: ${superAdminData.phone}`);
    console.log("\n⚠️  АНХААР: Нууц үгээ шууд солино уу!\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Алдаа:", error);
    process.exit(1);
  }
}

createSuperAdmin();
