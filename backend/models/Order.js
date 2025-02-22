const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    products: [
        {
            productId: mongoose.Schema.Types.ObjectId,
            quantity: Number,
        },
    ],
    totalAmount: Number,
    status: { type: String, default: "Pending" },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);