const express = require("express");
const Product = require("../models/Product");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

// ✅ FIX: Use Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "toy-store-products",
        allowedFormats: ["jpg", "png", "jpeg", "webp"]
    }
});

const upload = multer({ storage });

// ✅ Get all products
router.get("/", async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch products" });
    }
});

// ✅ Add a new product manually
router.post("/", async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.json({ message: "Product added successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to add product" });
    }
});

// ✅ Upload an image to Cloudinary
router.post("/upload", upload.single("image"), async (req, res) => {
    try {
        res.json({ imageUrl: req.file.path.secure_url });
    } catch (error) {
        res.status(500).json({ error: "Failed to upload image" });
    }
});
// ✅ Full-Text Search & Filtering API
router.get("/search", async (req, res) => {
    try {
        const { query, category, minPrice, maxPrice, inStock } = req.query;

        let filter = {};

        // ✅ Full-Text Search (if query is provided)
        if (query) {
            filter.$text = { $search: query };
        }

        // ✅ Filter by Category
        if (category) {
            filter.category = category;
        }

        // ✅ Filter by Price Range
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }

        // ✅ Filter by Stock Availability
        if (inStock === "true") {
            filter.stock = { $gt: 0 }; // Products that are in stock
        }

        // ✅ Execute Search Query
        const products = await Product.find(filter);
        res.json(products);

    } catch (error) {
        console.error("❌ Error fetching filtered products:", error);
        res.status(500).json({ message: "Server error fetching products" });
    }
});

module.exports = router;