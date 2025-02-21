const mongoose = require("../config/db");
const Product = require("../models/Product");
const fs = require("fs");
const path = require("path");

// ✅ Load real toy data from JSON file
const toyData = JSON.parse(fs.readFileSync(path.join(__dirname, "../real_toys.json"), "utf8"));

const insertProducts = async () => {
    try {
        await Product.deleteMany(); // Clear existing products
        await Product.insertMany(toyData);
        console.log("✅ Real Toy Data Inserted Successfully");
        process.exit();
    } catch (error) {
        console.error("❌ Error inserting products:", error);
        process.exit(1);
    }
};

insertProducts();
