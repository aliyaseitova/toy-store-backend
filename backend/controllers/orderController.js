const Order = require("../models/Order");
const Cart = require("../models/Cart");

exports.placeOrder = async (req, res) => {
    const { userId } = req.body;

    try {
        const cart = await Cart.findOne({ userId });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        const totalAmount = cart.items.reduce((sum, item) => sum + item.quantity * 10, 0);
        const newOrder = new Order({ userId, products: cart.items, totalAmount });

        await newOrder.save();
        await Cart.deleteOne({ userId });

        res.json({ message: "Order placed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error placing order", error });
    }
};

exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.params.userId });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Error fetching orders", error });
    }
};