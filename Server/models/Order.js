// ============================================================
//  Order.js — MongoDB Schema for Orders
//  Represents a food order placed by a customer.
//  Order lifecycle: pending → confirmed → preparing →
//                   out-for-delivery → delivered
// ============================================================

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    // Which customer placed this order
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },

    // Which restaurant/firm this order is from
    firm: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Firm',
        required: true
    },

    // List of items in the order (each item has product info + quantity)
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            },
            productname: String,   // Store name directly in case product is deleted
            price: Number,
            quantity: {
                type: Number,
                default: 1
            }
        }
    ],

    // Total price of the order
    totalAmount: {
        type: Number,
        required: true
    },

    // Where the food should be delivered
    deliveryAddress: {
        type: String,
        required: true
    },

    // Current status of the order (real-time tracking)
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'],
        default: 'pending'
    },

    // How the customer will pay
    paymentMethod: {
        type: String,
        enum: ['cash-on-delivery', 'online'],
        default: 'cash-on-delivery'
    }

}, {
    timestamps: true  // createdAt and updatedAt added automatically
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
