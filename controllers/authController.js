const User = require("../models/User");
const bcrypt = require("bcryptjs");
const twilio = require("twilio");
require("dotenv").config();

// ✅ Twilio Config
const client = new twilio.Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

// ✅ Generate a 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ✅ Send OTP via Twilio
const sendOTP = async (number, otp) => {
    try {
        console.log(`📤 Sending OTP ${otp} to ${number}...`);
        const message = await client.messages.create({
            body: `Your OTP for registration is: ${otp}`,
            from: twilioPhone,
            to: number
        });
        console.log(`✅ OTP sent to ${number}, SID: ${message.sid}`);
    } catch (err) {
        console.error("❌ Twilio Error:", err.message);
        throw new Error(`Failed to send OTP: ${err.message}`);
    }
};  


// ✅ Register User (With OTP Verification)
const register = async (req, res) => {
    try {
        const { name, email, password, number } = req.body;

        if (!name || !email || !password || !number) {
            return res.status(400).json({ message: "All fields are required." });
        }

        if (!number.startsWith("+") || number.length < 10) {
            return res.status(400).json({ message: "Invalid phone number format. Use country code (e.g., +91XXXXXXXXXX)." });
        }

        let user = await User.findOne({ number });

        if (user && user.isVerified) {
            return res.status(400).json({ message: "User already registered. Please log in." });
        }

        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes

        if (user) {
            user.otp = otp;
            user.otpExpires = otpExpires;
            user.password = await bcrypt.hash(password, 10);
        } else {
            user = new User({
                name,
                email,
                number,
                password: await bcrypt.hash(password, 10),
                otp,
                otpExpires,
                isVerified: false
            });
        }

        await user.save();
        await sendOTP(number, otp);

        res.status(200).json({ message: "OTP sent successfully. Please verify." });
    } catch (err) {
        console.error("❌ Registration Error:", err.message);
        res.status(500).json({ message: err.message });
    }
};

// ✅ Verify OTP (Only Once After Registration)
const verifyOTP = async (req, res) => {
    try {
        const { number, otp } = req.body;

        const user = await User.findOne({ number });

        if (!user) {
            return res.status(400).json({ message: "User not found. Please register first." });
        }

        if (!user.otp || user.otp !== otp || user.otpExpires < new Date()) {
            return res.status(400).json({ message: "Invalid or expired OTP." });
        }

        // ✅ Mark user as verified
        user.isVerified = true;
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        res.status(200).json({ message: "OTP verified successfully! You can now log in." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ✅ Login User (No OTP Required After Verification)
const login = async (req, res) => {
    try {
        const { name, password } = req.body;

        if (!name || !password) {
            return res.status(400).json({ message: "Name and password are required." });
        }

        const user = await User.findOne({ name });

        if (!user) {
            return res.status(400).json({ message: "User not found. Please register first." });
        }

        // ✅ Removed the OTP verification check here after first-time verification
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password. Please try again." });
        }

        res.status(200).json({
            message: "Login successful",
            user: {
                name: user.name,
                email: user.email,
                number: user.number
            }
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ✅ List Users
const listUsers = async (req, res) => {
    try {
        const users = await User.find({}, "name email number");
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ✅ Delete User
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await User.findByIdAndDelete(id);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ✅ Forgot Password (Send OTP)
const forgotPassword = async (req, res) => {
    try {
        const { number } = req.body;

        if (!number.startsWith("+") || number.length < 10) {
            return res.status(400).json({ message: "Invalid phone number format. Use country code (e.g., +91XXXXXXXXXX)." });
        }

        const user = await User.findOne({ number });
        if (!user) {
            return res.status(400).json({ message: "User not found. Please register first." });
        }

        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        await sendOTP(number, otp);

        res.status(200).json({ message: "OTP sent to your registered phone number." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ✅ Reset Password
const resetPassword = async (req, res) => {
    try {
        const { number, otp, newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long." });
        }

        const user = await User.findOne({ number });

        if (!user) {
            return res.status(400).json({ message: "User not found. Please register first." });
        }

        if (!user.otp || user.otp !== otp || user.otpExpires < new Date()) {
            return res.status(400).json({ message: "Invalid or expired OTP." });
        }

        // ✅ Update password
        user.password = await bcrypt.hash(newPassword, 10);
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        res.status(200).json({ message: "Password reset successfully! You can now log in with the new password." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// ✅ Export Routes
module.exports = { register, verifyOTP, login, listUsers, deleteUser,forgotPassword,resetPassword };
