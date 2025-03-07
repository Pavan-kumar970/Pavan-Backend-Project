const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error("❌ MongoDB URI is missing. Check your .env file.");
    }

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
    });

    console.log("✅ MongoDB Connected Successfully");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);

    if (err.message.includes("ENOTFOUND") || err.message.includes("ECONNREFUSED")) {
      console.error("🔴 Check if your MongoDB Atlas cluster is running and your URI is correct.");
    }

    process.exit(1); // Stop the server if MongoDB connection fails
  }
};

module.exports = connectDB;
