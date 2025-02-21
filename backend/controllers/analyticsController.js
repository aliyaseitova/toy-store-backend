const Order = require("../models/Order");
const Product = require("../models/Product");

// ✅ Get Total Number of Orders
exports.getTotalOrders = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments(); // Count total orders
        res.json({ totalRevenue: totalOrders }); // Change from totalAmount to totalOrders
    } catch (error) {
        res.status(500).json({ message: "Error fetching total orders", error });
    }
};

// ✅ Get Most Ordered Products
exports.getPopularProducts = async (req, res) => {
    try {
        const popularProducts = await Order.aggregate([
            { $unwind: "$products" },
            { $group: { _id: "$products.productId", count: { $sum: "$products.quantity" } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        const detailedProducts = await Product.find({ _id: { $in: popularProducts.map(p => p._id) } });

        // ✅ Attach Order Count to Product Data
        const productsWithCount = detailedProducts.map(product => {
            const matching = popularProducts.find(p => p._id.toString() === product._id.toString());
            return { ...product.toObject(), count: matching ? matching.count : 0 };
        });

        res.json(productsWithCount);
    } catch (error) {
        res.status(500).json({ message: "Error fetching popular products", error });
    }
};
