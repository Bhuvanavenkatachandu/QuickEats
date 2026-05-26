// ============================================================
//  Customer.js — MongoDB Schema for Customers
//  A "schema" is like a blueprint — it defines the shape of
//  data we store in the database.
// ============================================================

const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true  // Every customer must have a name
    },
    email: {
        type: String,
        required: true,
        unique: true    // No two customers can share the same email
    },
    password: {
        type: String,
        required: true  // Will be stored as a hashed (encrypted) value
    },
    phone: {
        type: String    // Optional phone number
    },
    address: {
        type: String    // Optional default delivery address
    }
}, {
    timestamps: true    // Automatically adds createdAt and updatedAt fields
});

const Customer = mongoose.model('Customer', customerSchema);
module.exports = Customer;
