// ============================================================
//  firmController.js — Handles Restaurant/Firm Management
//  UPDATED: Added Redis cache invalidation when firms change.
//  When a firm is added or deleted, related caches are cleared.
// ============================================================

const Firm = require('../models/Firm');
const Vendor = require('../models/Vendor');
const multer = require('multer');
const path = require('path');
const redisClient = require('../config/redisClient');

// Multer setup for firm image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Images go into the uploads folder
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

// ─── ADD FIRM ───────────────────────────────────────────────
// POST /firm/add-firm  (requires vendor login token)
const addFirm = async (req, res) => {
    try {
        const { firmname, area, category, region, offer } = req.body;
        const image = req.file ? req.file.filename : undefined;

        // req.vendorId is set by verifyToken middleware
        const vendor = await Vendor.findById(req.vendorId);
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found.' });
        }

        // Each vendor can only have ONE firm/restaurant
        if (vendor.firm.length > 0) {
            return res.status(400).json({ message: 'vendor can have only one firm' });
        }

        // Create the new firm/restaurant
        const newFirm = new Firm({
            firmname, area, category, region, offer, image
        });

        const savedFirm = await newFirm.save();

        // Link this firm to the vendor
        vendor.firm.push(savedFirm._id);
        await vendor.save();

        // ── Invalidate Caches ──
        // Vendor data changed → clear vendor caches
        await redisClient.del('all_vendors');
        await redisClient.del(`vendor:${req.vendorId}`);

        res.status(201).json({
            message: 'Firm created successfully!',
            firmId: savedFirm._id
        });

    } catch (error) {
        console.error('Add Firm Error:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// ─── DELETE FIRM ────────────────────────────────────────────
// DELETE /firm/:firmId
const deleteFirmById = async (req, res) => {
    try {
        const { firmId } = req.params;

        const deletedFirm = await Firm.findByIdAndDelete(firmId);
        if (!deletedFirm) {
            return res.status(404).json({ error: 'Firm not found.' });
        }

        // Invalidate related caches
        await redisClient.del('all_vendors');
        await redisClient.del(`products:${firmId}`);

        res.status(200).json({ success: 'Firm deleted successfully!' });

    } catch (error) {
        console.error('Delete Firm Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Export — addFirm uses multer middleware for image upload
module.exports = {
    addFirm: [upload.single('image'), addFirm],
    deleteFirmById
};
