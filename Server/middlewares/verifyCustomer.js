// ============================================================
//  verifyCustomer.js — Middleware for Customer Authentication
//  This function runs BEFORE any protected route handler.
//  It checks that the request has a valid customer JWT token.
//  "Middleware" = a function that runs between the request
//  arriving and your route handler running.
// ============================================================

const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const dotenv = require('dotenv');
dotenv.config();

const secretKey = process.env.CUSTOMER_JWT_SECRET;

const verifyCustomer = async (req, res, next) => {
    // Get token from the request header
    const token = req.headers['token'] || req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ error: 'Token is required. Please login first.' });
    }

    try {
        // Decode the token to get the customerId
        const decoded = jwt.verify(token, secretKey);

        // Find the customer in the database
        const customer = await Customer.findById(decoded.customerId);
        if (!customer) {
            return res.status(401).json({ error: 'Customer not found. Please login again.' });
        }

        // Attach customerId to the request so the next handler can use it
        req.customerId = customer._id;
        next(); // Move on to the actual route handler

    } catch (error) {
        console.error('Token verification error:', error.message);
        res.status(401).json({ error: 'Invalid or expired token. Please login again.' });
    }
};

module.exports = verifyCustomer;
