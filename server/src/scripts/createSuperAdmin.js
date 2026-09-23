require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");

const createSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const name = process.env.INITIAL_ADMIN_NAME;
    const username = process.env.INITIAL_ADMIN_USERNAME;
    const password = process.env.INITIAL_ADMIN_PASSWORD;

    if (!name || !username || !password) {
      throw new Error(
        "INITIAL_ADMIN_NAME, INITIAL_ADMIN_USERNAME and INITIAL_ADMIN_PASSWORD are required",
      );
    }

    if (password.length < 8) {
      throw new Error("Admin password must contain at least 8 characters");
    }

    const cleanUsername = username.toLowerCase().trim();

    const existingAdmin = await User.findOne({
      role: "super_admin",
    });

    const usernameTaken = await User.findOne({
      username: cleanUsername,
      ...(existingAdmin && {
        _id: { $ne: existingAdmin._id },
      }),
    });

    if (usernameTaken) {
      throw new Error("This username is already used by another account");
    }
    if (existingAdmin) {
      existingAdmin.name = name.trim();
      existingAdmin.username = cleanUsername;
      existingAdmin.password = password;
      existingAdmin.role = "super_admin";
      existingAdmin.company = null;
      existingAdmin.isActive = true;

      await existingAdmin.save();

      console.log("Existing super admin updated successfully");
      console.log(`Username: ${existingAdmin.username}`);
      return;
    }

    const admin = await User.create({
      name,
      username,
      password,
      role: "super_admin",
      company: null,
    });

    console.log("Super admin created successfully");
    console.log(`Username: ${admin.username}`);
  } catch (error) {
    console.error("Admin creation failed:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
};

createSuperAdmin();
