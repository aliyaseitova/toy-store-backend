const express = require("express");
const { getTotalOrders, getPopularProducts } = require("../controllers/analyticsController");

const router = express.Router();

// ✅ Route to Get Total Orders
router.get("/sales", getTotalOrders);

// ✅ Route to Get Most Ordered Products
router.get("/popular-products", getPopularProducts);

module.exports = router;
