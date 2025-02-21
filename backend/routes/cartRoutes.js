const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const router = express.Router();
const { updateCartQuantity } = require("../controllers/cartController");


// ✅ Get user cart with product details
router.get("/:userId", async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.params.userId }).populate("items.productId");
        if (!cart) return res.json({ items: [] });

        res.json({
            items: cart.items.map(item => ({
                _id: item.productId._id,
                name: item.productId.name,
                price: item.productId.price,
                image: item.productId.image,
                quantity: item.quantity
            }))
        });
    } catch (error) {
        console.error("❌ Error retrieving cart:", error);
        res.status(500).json({ message: "Error retrieving cart", error });
    }
});

// ✅ Add to cart (Fix quantity issue)
router.post("/add", async (req, res) => {
    const { userId, productId, quantity } = req.body;

    // ✅ Ensure quantity is a valid number
    if (!quantity || isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({ message: "Invalid quantity" });
    }

    try {
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        // Check if product already exists in cart
        const existingItem = cart.items.find(item => item.productId.toString() === productId);
        if (existingItem) {
            existingItem.quantity += Number(quantity);
        } else {
            cart.items.push({ productId, quantity: Number(quantity) });
        }

        await cart.save();
        res.json({ message: "✅ Product added to cart", cart });

    } catch (error) {
        console.error("❌ Error adding to cart:", error);
        res.status(500).json({ message: "Error adding to cart", error });
    }
});


// ✅ Remove item from cart
router.post("/remove", async (req, res) => {
    const { userId, productId } = req.body;

    try {
        let cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        cart.items = cart.items.filter(item => item.productId.toString() !== productId);
        await cart.save();

        res.json({ message: "✅ Item removed from cart" });
    } catch (error) {
        console.error("❌ Error removing from cart:", error);
        res.status(500).json({ message: "Error removing from cart", error });
    }
});
router.post("/update", updateCartQuantity);
module.exports = router;
