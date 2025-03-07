const express = require("express");
const { listUsers, deleteUser } = require("../controllers/authController"); 

const router = express.Router();

// ✅ Now all users can access these routes
router.get("/users", listUsers);
router.delete("/users/:id", deleteUser);

module.exports = router;
