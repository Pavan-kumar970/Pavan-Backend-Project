const express = require('express');
const { register, login, listUsers, deleteUser, verifyOTP, forgotPassword, resetPassword } = require('../controllers/authController');
const { createProduct, getProducts, getProductById, updateProduct, deleteProduct } = require('../controllers/productController');

const router = express.Router();

// ✅ Auth Routes
router.post('/register', register);
router.post("/verify-otp", verifyOTP);
router.post('/login', login);
router.get('/users', listUsers);
router.delete('/users/:id', deleteUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// ✅ Product Routes under `/api/auth`
router.post('/products', createProduct);
router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

module.exports = router;
