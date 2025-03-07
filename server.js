require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes"); // ✅ Import Admin Routes
const productRoutes = require('./routes/productRoutes'); 
const app = express();
app.use(express.json());
app.use(cors());

connectDB();

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes); // ✅ Protect admin routes
app.use('/api/products', productRoutes); // Correct API endpoint
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
