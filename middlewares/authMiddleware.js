const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ✅ Authentication Middleware
const authenticateUser = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (!token) return res.status(401).json({ message: "Unauthorized. Token is missing." });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");
        if (!req.user) return res.status(401).json({ message: "User not found. Invalid token." });

        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid or expired token." });
    }
};

// ✅ Admin Authorization Middleware
const authorizeAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: "Access denied. Admins only!" });
    }
    next();
};

module.exports = { authenticateUser, authorizeAdmin };
