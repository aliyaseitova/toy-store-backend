const express = require("express");
const Order = require("../models/Order");
const Cart = require("../models/Cart");

const router = express.Router();

// Place an order
router.post("/", async (req, res) => {
    const { userId } = req.body;
    const cart = await Cart.findOne({ userId });

    if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
    }

    const totalAmount = cart.items.reduce((sum, item) => sum + item.quantity * 10, 0); // Example price calculation
    const newOrder = new Order({ userId, products: cart.items, totalAmount });

    await newOrder.save();
    await Cart.deleteOne({ userId }); // Empty cart after order placement

    res.json({ message: "Order placed successfully" });
});

// Get user orders
router.get("/:userId", async (req, res) => {
    const orders = await Order.find({ userId: req.params.userId });
    res.json(orders);
});
router.post("/checkout", async (req, res) => {
    const { userId } = req.body;
    try {
        const cart = await Cart.findOne({ userId });
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        // ✅ Debugging: Log to Terminal
        console.log("🛒 Logging order for User:", userId, "Items:", cart.items.length);

        // ✅ Save Order Log
        const log = await Log.create({
            type: "order",
            details: { userId, totalItems: cart.items.length },
            timestamp: new Date()
        });

        console.log("✅ Order Log Saved:", log);

        // ✅ Clear cart after order
        await Cart.deleteOne({ userId });

        res.json({ message: "Checkout successful! Order logged." });
    } catch (error) {
        console.error("❌ Error during checkout:", error);
        res.status(500).json({ message: "Checkout failed" });
    }
});

module.exports = router;