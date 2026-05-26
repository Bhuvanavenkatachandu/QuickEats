// ============================================================
//  vendorController.js — Handles Vendor Registration & Login
//  UPDATED: Added Redis caching for vendor lookups.
//  Now vendor list and single vendor data are cached in Redis,
//  reducing repeated MongoDB queries significantly.
// ============================================================

const Vendor = require('../models/Vendor');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const redisClient = require('../config/redisClient'); // Redis for caching

dotenv.config();

const secretKey = process.env.whatisurname;

// ─── REGISTER ───────────────────────────────────────────────
// POST /vendor/register
const vendorRegister = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if vendor already exists with this email
        const existingVendor = await Vendor.findOne({ email });
        if (existingVendor) {
            return res.status(400).json({ message: 'Vendor already exists with this email.' });
        }

        // Hash password before saving (security best practice)
        const hashedPassword = await bcrypt.hash(password, 10);

        const newVendor = new Vendor({ username, email, password: hashedPassword });
        await newVendor.save();

        // Invalidate the "all vendors" cache so fresh data appears
        await redisClient.del('all_vendors');

        console.log('New vendor registered:', email);
        res.status(201).json({ message: 'Vendor registered successfully!' });

    } catch (error) {
        console.error('Vendor Register Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// ─── LOGIN ──────────────────────────────────────────────────
// POST /vendor/login
const vendorLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const vendor = await Vendor.findOne({ email });

        // Check email exists and password matches
        if (!vendor || !(await bcrypt.compare(password, vendor.password))) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Create JWT token — acts like a "login session key"
        const token = jwt.sign(
            { vendorId: vendor._id },
            secretKey,
            { expiresIn: '24h' } // Token valid for 24 hours
        );

        console.log('Vendor logged in:', email);
        res.status(200).json({
            success: 'Login successful!',
            token,
            vendorId: vendor._id
        });

    } catch (error) {
        console.error('Vendor Login Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// ─── GET ALL VENDORS (with Redis caching) ───────────────────
// GET /vendor/all-vendors
const getAllvendors = async (req, res) => {
    const cacheKey = 'all_vendors';

    try {
        // Step 1: Check if data is in Redis cache
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            console.log('✅ Cache HIT — All vendors from Redis');
            return res.status(200).json(JSON.parse(cachedData));
        }

        // Step 2: Not in cache → fetch from MongoDB
        console.log('⚠️  Cache MISS — fetching all vendors from MongoDB');
        const vendors = await Vendor.find().populate('firm');

        const responseData = { vendors };

        // Step 3: Store in Redis for 60 seconds to speed up future requests
        await redisClient.setEx(cacheKey, 60, JSON.stringify(responseData));

        res.status(200).json(responseData);

    } catch (error) {
        console.error('Get All Vendors Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// ─── GET SINGLE VENDOR BY ID (with Redis caching) ───────────
// GET /vendor/single-vendor/:vendorId
const getVendorid = async (req, res) => {
    const { vendorId } = req.params;
    const cacheKey = `vendor:${vendorId}`;

    try {
        // Check cache
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            console.log(`✅ Cache HIT — Vendor ${vendorId} from Redis`);
            return res.status(200).json(JSON.parse(cachedData));
        }

        // Cache miss → fetch from MongoDB
        console.log(`⚠️  Cache MISS — fetching vendor ${vendorId} from MongoDB`);
        const vendor = await Vendor.findById(vendorId).populate('firm');

        if (!vendor) {
            return res.status(404).json({ error: 'Vendor not found.' });
        }

        const responseData = { vendor };

        // Cache for 60 seconds
        await redisClient.setEx(cacheKey, 60, JSON.stringify(responseData));

        res.status(200).json(responseData);

    } catch (error) {
        console.error('Get Vendor Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { vendorRegister, vendorLogin, getAllvendors, getVendorid };