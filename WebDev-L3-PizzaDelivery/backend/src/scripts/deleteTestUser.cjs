
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function deleteTestUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected!");

    // Create a temporary user for deletion testing
    const hashedPassword = await bcrypt.hash("DeleteTest123", 10);

    await User.create({
      name: "Temporary User",
      email: "delete.test@example.com",
      password: hashedPassword,
    });

    console.log("Temporary user created!");

    // Find and delete the temporary user
    const deletedUser = await User.findOneAndDelete({
      email: "delete.test@example.com",
    }).select("-password");

    if (!deletedUser) {
      console.log("User not found");
      return;
    }

    console.log("User deleted successfully!");
    console.log(deletedUser);

  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
}

deleteTestUser();
