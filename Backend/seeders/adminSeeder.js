require("dotenv").config({ path: `${__dirname}/../.env` });
const mongoose = require("mongoose");
const connectDB = require("../DataBase/connectDB");
const User = require("../Models/UserModel");

(async () => {
  try {
    await connectDB();

    // Remove any existing admin so we start fresh
    await User.deleteOne({ email: "admin@lms.com" });

    // Pass plain-text password — the model's pre("save") hook will hash it
    const admin = new User({
      name: "Admin",
      email: "admin@lms.com",
      password: "Admin@1234",
      phone: "03001234567",
      role: "admin",
      accountVerified: true,
    });
    await admin.save();

    console.log("✅ Admin created");
    console.log("   Email   : admin@lms.com");
    console.log("   Password: Admin@1234");
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    mongoose.disconnect();
  }
})();
