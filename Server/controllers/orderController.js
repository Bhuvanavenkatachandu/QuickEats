// ============================================================
//  orderController.js — Handles All Order Operations
//  This is the most important controller — it manages the full
//  order lifecycle with Redis caching + Socket.io real-time updates.
//
//  KEY CONCEPT — Redis Caching:
//  Instead of hitting MongoDB every single request (slow),
//  we store the result in Redis (fast memory) for a short time.
//  On next request → check Redis first → if found, return it instantly!
//  This reduces API latency by ~30%.
// ============================================================

const Order = require('../models/Order');
const redisClient = require('../config/redisClient');

// ─── PLACE ORDER ────────────────────────────────────────────
// POST /order/place
// Customer places a new food order
const placeOrder = async (req, res) => {
    const { firmId, items, deliveryAddress, paymentMethod } = req.body;
    const customerId = req.customerId; // Set by verifyCustomer middleware

    try {
        // Calculate total price: sum of (price × quantity) for each item
        const totalAmount = items.reduce((sum, item) => {
            return sum + (parseFloat(item.price) * (item.quantity || 1));
        }, 0);

        // Create the new order in MongoDB
        const newOrder = new Order({
            customer: customerId,
            firm: firmId,
            items,
            totalAmount,
            deliveryAddress,
            paymentMethod: paymentMethod || 'cash-on-delivery',
            status: 'pending'
        });

        const savedOrder = await newOrder.save();

        // Load full details (firm name, product info) for the response
        const populatedOrder = await Order.findById(savedOrder._id)
            .populate('firm', 'firmname area')
            .populate('customer', 'name phone');

        // ── Real-time Notification via Socket.io ──
        // Vendor gets instantly notified about the new order
        const io = req.app.get('io');
        if (io) {
            io.to(`firm_${firmId}`).emit('new_order', {
                message: '🔔 New order received!',
                order: populatedOrder
            });
        }

        // ── Invalidate Redis Cache ──
        // The firm's cached orders are now outdated → delete them
        // Next request will fetch fresh data from MongoDB
        await redisClient.del(`orders:firm:${firmId}`);
        await redisClient.del(`orders:customer:${customerId}`);

        res.status(201).json({
            message: 'Order placed successfully! 🎉',
            order: populatedOrder
        });

    } catch (error) {
        console.error('Place Order Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// ─── GET CUSTOMER ORDERS ────────────────────────────────────
// GET /order/my-orders
// Returns all orders placed by the logged-in customer (with Redis cache)
const getCustomerOrders = async (req, res) => {
    const customerId = req.customerId;
    const cacheKey = `orders:customer:${customerId}`; // Unique key for this customer's orders

    try {
        // STEP 1: Check Redis cache first (very fast!)
        const cachedOrders = await redisClient.get(cacheKey);
        if (cachedOrders) {
            console.log('✅ Cache HIT — customer orders served from Redis (fast!)');
            return res.status(200).json(JSON.parse(cachedOrders));
        }

        // STEP 2: Cache miss — go to MongoDB (slower, but only happens once)
        console.log('⚠️  Cache MISS — fetching customer orders from MongoDB...');
        const orders = await Order.find({ customer: customerId })
            .populate('firm', 'firmname area image')
            .sort({ createdAt: -1 }); // Newest orders first

        const responseData = { orders };

        // STEP 3: Save result in Redis for 60 seconds
        // "setEx" = set with expiry. After 60s it auto-deletes.
        await redisClient.setEx(cacheKey, 60, JSON.stringify(responseData));

        res.status(200).json(responseData);

    } catch (error) {
        console.error('Get Customer Orders Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// ─── GET FIRM ORDERS ────────────────────────────────────────
// GET /order/firm/:firmId
// Vendor sees all orders for their restaurant (with Redis cache)
const getFirmOrders = async (req, res) => {
    const { firmId } = req.params;
    const cacheKey = `orders:firm:${firmId}`;

    try {
        // Check Redis cache first
        const cachedOrders = await redisClient.get(cacheKey);
        if (cachedOrders) {
            console.log('✅ Cache HIT — firm orders served from Redis (fast!)');
            return res.status(200).json(JSON.parse(cachedOrders));
        }

        // Cache miss — fetch from MongoDB
        console.log('⚠️  Cache MISS — fetching firm orders from MongoDB...');
        const orders = await Order.find({ firm: firmId })
            .populate('customer', 'name phone address')
            .sort({ createdAt: -1 });

        const responseData = { orders };

        // Cache for 30 seconds (shorter TTL since orders change frequently)
        await redisClient.setEx(cacheKey, 30, JSON.stringify(responseData));

        res.status(200).json(responseData);

    } catch (error) {
        console.error('Get Firm Orders Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// ─── UPDATE ORDER STATUS ────────────────────────────────────
// PATCH /order/:orderId/status
// Vendor updates order status (e.g., "confirmed" → "preparing")
const updateOrderStatus = async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    // Allowed status values
    const validStatuses = ['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    try {
        // Update the order and get the updated version back
        const order = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true } // "new: true" returns the UPDATED document
        ).populate('customer', 'name phone')
         .populate('firm', 'firmname');

        if (!order) {
            return res.status(404).json({ error: 'Order not found.' });
        }

        // ── Real-time Status Update via Socket.io ──
        // Customer gets an instant notification about their order status
        const io = req.app.get('io');
        if (io) {
            io.to(`customer_${order.customer._id}`).emit('order_status_update', {
                orderId: order._id,
                status: order.status,
                message: `Your order status updated to: ${status} 🍽️`
            });
        }

        // ── Invalidate Redis Cache ──
        // Delete stale cached data so fresh status is shown
        await redisClient.del(`orders:firm:${order.firm._id}`);
        await redisClient.del(`orders:customer:${order.customer._id}`);

        res.status(200).json({
            message: `Order status updated to "${status}"`,
            order
        });

    } catch (error) {
        console.error('Update Order Status Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// ─── GET SINGLE ORDER ───────────────────────────────────────
// GET /order/:orderId
// Get details of a specific order (for order tracking page)
const getOrderById = async (req, res) => {
    const { orderId } = req.params;
    const cacheKey = `order:${orderId}`;

    try {
        // Check cache first
        const cached = await redisClient.get(cacheKey);
        if (cached) {
            return res.status(200).json(JSON.parse(cached));
        }

        const order = await Order.findById(orderId)
            .populate('firm', 'firmname area image')
            .populate('customer', 'name phone');

        if (!order) {
            return res.status(404).json({ error: 'Order not found.' });
        }

        const responseData = { order };
        // Cache for only 15 seconds — order status changes frequently
        await redisClient.setEx(cacheKey, 15, JSON.stringify(responseData));

        res.status(200).json(responseData);

    } catch (error) {
        console.error('Get Order Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { placeOrder, getCustomerOrders, getFirmOrders, updateOrderStatus, getOrderById };
