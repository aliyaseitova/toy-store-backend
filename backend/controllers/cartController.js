const Cart = require("../models/Cart");
const Product = require("../models/Product");

exports.updateCartQuantity = async (req, res) => {
    const { userId, productId, quantity } = req.body;

    try {
        let cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        // ✅ Ensure quantity is valid
        const qty = parseInt(quantity);
        if (isNaN(qty) || qty < 1) {
            return res.status(400).json({ message: "Invalid quantity" });
        }

        const cartItem = cart.items.find(item => item.productId.toString() === productId);
        if (!cartItem) {
            return res.status(404).json({ message: "Product not found in cart" });
        }

        cartItem.quantity = qty; // Update quantity
        await cart.save();
        res.json({ message: "✅ Cart updated", cart });

    } catch (error) {
        console.error("❌ Error updating cart:", error);
        res.status(500).json({ message: "Error updating cart", error });
    }
};

// ✅ Fetch Cart & Populate Product Details
exports.getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.params.userId }).populate("items.productId");

        if (!cart || cart.items.length === 0) {
            return res.json({ items: [] });
        }

        // ✅ Format cart items properly
        const formattedCart = cart.items.map(item => ({
            _id: item.productId._id,
            name: item.productId.name,
            price: item.productId.price,
            image: item.productId.image,
            quantity: item.quantity
        }));

        res.json({ items: formattedCart });
    } catch (error) {
        console.error("❌ Error retrieving cart:", error);
        res.status(500).json({ message: "Error retrieving cart", error });
    }
};

// ✅ Add to Cart (Ensures product exists before adding)
exports.addToCart = async (req, res) => {
    const { userId, productId, quantity } = req.body;

    try {
        // ✅ Ensure quantity is valid
        if (!quantity || isNaN(quantity) || quantity <= 0) {
            return res.status(400).json({ message: "Invalid quantity" });
        }

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        // ✅ Fetch Product Details
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const existingItem = cart.items.find(item => item.productId.toString() === productId);
        if (existingItem) {
            existingItem.quantity += Number(quantity);
        } else {
            cart.items.push({ productId, quantity: Number(quantity), price: product.price });
        }

        await cart.save();
        res.json({ message: "✅ Product added to cart", cart });

    } catch (error) {
        console.error("❌ Error adding to cart:", error);
        res.status(500).json({ message: "Server error adding to cart", error });
    }
};
