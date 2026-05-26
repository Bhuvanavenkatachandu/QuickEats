// ============================================================
//  productController.js — Handles Product Management
//  UPDATED: Added Redis caching for product fetching.
//  When a product is added or deleted, the cache is cleared
//  so fresh data is always served on next request.
// ============================================================

const Product = require('../models/Product');
const Firm = require('../models/Firm');
const multer = require('multer');
const path = require('path');
const redisClient = require('../config/redisClient'); // Redis for caching

// Multer handles file uploads (product images)
// Files are saved into the "uploads/" folder on the server
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Save images in the uploads folder
    },
    filename: function (req, file, cb) {
        // Give each file a unique name using timestamp + original extension
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

// ─── ADD PRODUCT ────────────────────────────────────────────
// POST /product/add-product/:firmId
const addProduct = async (req, res) => {
    try {
        const { productname, price, category, bestSellar, description } = req.body;
        const image = req.file ? req.file.filename : undefined;
        const { firmId } = req.params;

        // Find the firm this product belongs to
        const firm = await Firm.findById(firmId);
        if (!firm) {
            return res.status(404).json({ error: 'Firm not found.' });
        }

        // Create the new product
        const product = new Product({
            productname, price, category, bestSellar, description, image,
            firm: firm._id
        });

        const savedProduct = await product.save();

        // Link this product to the firm
        firm.product.push(savedProduct._id);
        await firm.save();

        // ── Invalidate Redis Cache ──
        // Products changed → delete stale cache for this firm
        await redisClient.del(`products:${firmId}`);

        res.status(201).json({
            message: 'Product added successfully!',
            product: savedProduct
        });

    } catch (error) {
        console.error('Add Product Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// ─── GET PRODUCTS BY FIRM (with Redis caching) ──────────────
// GET /product/:firmId/products
const getProductByFirm = async (req, res) => {
    const { firmId } = req.params;
    const cacheKey = `products:${firmId}`;

    try {
        // Step 1: Check Redis cache (instant!)
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            console.log(`✅ Cache HIT — Products for firm ${firmId} from Redis`);
            return res.status(200).json(JSON.parse(cachedData));
        }

        // Step 2: Cache miss → get from MongoDB
        console.log(`⚠️  Cache MISS — fetching products for firm ${firmId} from MongoDB`);
        const firm = await Firm.findById(firmId);
        if (!firm) {
            return res.status(404).json({ error: 'Firm not found.' });
        }

        const products = await Product.find({ firm: firmId });

        const responseData = {
            restaurentName: firm.firmname,
            products
        };

        // Step 3: Cache for 30 seconds
        await redisClient.setEx(cacheKey, 30, JSON.stringify(responseData));

        res.status(200).json(responseData);

    } catch (error) {
        console.error('Get Products Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// ─── DELETE PRODUCT ─────────────────────────────────────────
// DELETE /product/:productId
const deleteProductById = async (req, res) => {
    try {
        const { productId } = req.params;

        const deletedProduct = await Product.findByIdAndDelete(productId);
        if (!deletedProduct) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        // Invalidate the cache for the firm this product belonged to
        if (deletedProduct.firm && deletedProduct.firm.length > 0) {
            const firmId = deletedProduct.firm[0];
            await redisClient.del(`products:${firmId}`);
        }

        res.status(200).json({ message: 'Product deleted successfully!' });

    } catch (error) {
        console.error('Delete Product Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Export — addProduct uses the upload middleware for image handling
module.exports = {
    addProduct: [upload.single('image'), addProduct],
    getProductByFirm,
    deleteProductById
};