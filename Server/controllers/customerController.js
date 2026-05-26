// ============================================================
//  customerController.js — Handles Customer Registration & Login
//  This file contains the "business logic" for customers.
//  Think of controllers as the brain — routes tell WHAT to do,
//  controllers decide HOW to do it.
// ============================================================

const Customer = require('../models/Customer');
const bcrypt = require('bcryptjs');     // For password hashing
const jwt = require('jsonwebtoken');    // For creating login tokens
const dotenv = require('dotenv');
dotenv.config();

const secretKey = process.env.CUSTOMER_JWT_SECRET;

// ─── REGISTER ───────────────────────────────────────────────
// POST /customer/register
// Creates a new customer account
const customerRegister = async (req, res) => {
    const { name, email, password, phone, address } = req.body;

    try {
        // Step 1: Check if this email is already registered
        const existingCustomer = await Customer.findOne({ email });
        if (existingCustomer) {
            return res.status(400).json({ message: 'Email already registered. Please login.' });
        }

        // Step 2: Hash the password (NEVER store plain passwords in database!)
        // bcrypt.hash(password, 10) — "10" is the "salt rounds" (higher = more secure but slower)
        const hashedPassword = await bcrypt.hash(password, 10);

        // Step 3: Create and save the new customer
        const newCustomer = new Customer({
            name,
            email,
            password: hashedPassword,
            phone,
            address
        });

        await newCustomer.save();

        console.log('New customer registered:', email);
        res.status(201).json({ message: 'Registration successful! Please login.' });

    } catch (error) {
        console.error('Register Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// ─── LOGIN ──────────────────────────────────────────────────
// POST /customer/login
// Authenticates a customer and returns a JWT token
const customerLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Step 1: Find customer by email
        const customer = await Customer.findOne({ email });

        // Step 2: Check if customer exists AND password is correct
        // bcrypt.compare() checks the plain password against the stored hash
        if (!customer || !(await bcrypt.compare(password, customer.password))) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Step 3: Create a JWT token — like a temporary "key card"
        // The token contains the customerId so we know WHO is making requests
        const token = jwt.sign(
            { customerId: customer._id },
            secretKey,
            { expiresIn: '7d' }  // Token is valid for 7 days
        );

        console.log('Customer logged in:', email);
        res.status(200).json({
            success: 'Login successful!',
            token,
            customerId: customer._id,
            name: customer.name
        });

    } catch (error) {
        console.error('Login Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// ─── GET PROFILE ────────────────────────────────────────────
// GET /customer/profile
// Returns customer details (requires login token)
const getCustomerProfile = async (req, res) => {
    try {
        // req.customerId is set by the verifyCustomer middleware
        // .select('-password') means "return everything EXCEPT the password"
        const customer = await Customer.findById(req.customerId).select('-password');

        if (!customer) {
            return res.status(404).json({ error: 'Customer not found.' });
        }

        res.status(200).json({ customer });

    } catch (error) {
        console.error('Profile Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { customerRegister, customerLogin, getCustomerProfile };
