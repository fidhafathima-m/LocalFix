import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "../src/models/UserSchema"; // Adjust the path if your User model is elsewhere

dotenv.config();

const createAdmin = async () => {
  try {
    // ---- 1️⃣ Connect to MongoDB ----
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI is not defined in your .env file");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // ---- 2️⃣ Define admin credentials ----
    const fullName = "Super Admin";
    const email = "localfix.business@gmail.com";
    const password = "Admin@123"; // Change before running in production!

    // ---- 3️⃣ Check if admin already exists ----
    const existingAdmin = await User.findOne({ email, roles: "admin" });
    if (existingAdmin) {
      console.log("⚠️ Admin already exists:", existingAdmin.email);
      process.exit(0);
    }

    // ---- 4️⃣ Hash the password ----
    const passwordHash = await bcrypt.hash(password, 10);

    // ---- 5️⃣ Create the admin user ----
    const adminUser = new User({
      fullName,
      email,
      passwordHash,
      isVerified: true,
      roles: ["admin"],
      status: "Active",
    });

    await adminUser.save();
    console.log("🎉 Admin created successfully!");
    console.log({
      fullName,
      email,
      password,
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();
