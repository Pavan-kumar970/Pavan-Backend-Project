const Product = require('../models/Product');

// ✅ Create Product
const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock, image } = req.body;
        if (!name || !price || !category || stock === undefined) {
            return res.status(400).json({ message: "All fields are required." });
        }
        
        const product = new Product({ name, description, price, category, stock, image });
        await product.save();
        res.status(201).json({ message: "Product created successfully", product });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ✅ Get All Products
const getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ✅ Get Single Product
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ✅ Update Product
const updateProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock, image } = req.body;
        const product = await Product.findByIdAndUpdate(req.params.id, { name, description, price, category, stock, image }, { new: true });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ message: "Product updated successfully", product });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ✅ Delete Product
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ✅ Make sure all functions are exported properly
module.exports = { createProduct, getProducts, getProductById, updateProduct, deleteProduct };
