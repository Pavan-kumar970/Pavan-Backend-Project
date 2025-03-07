const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true },
    password: { type: String },
    number: { type: String, required: true, unique: true }, 
    isAdmin: { type: Boolean, default: false },
    otp: { type: String }, // Store OTP
    otpExpires: { type: Date } // OTP Expiry Time
});

module.exports = mongoose.model("User", UserSchema);
