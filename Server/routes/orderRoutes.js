// ============================================================
//  orderRoutes.js — API Routes for Order Management
//  All order actions flow through here.
//  Some routes require customer login, some are open for vendors.
// ============================================================

const express = require('express');
const router = express.Router();
const {
    placeOrder,
    getCustomerOrders,
    getFirmOrders,
    updateOrderStatus,
    getOrderById
} = require('../controllers/orderController');
const verifyCustomer = require('../middlewares/verifyCustomer');

// Customer must be logged in to place/view their orders
router.post('/place', verifyCustomer, placeOrder);         // POST /order/place
router.get('/my-orders', verifyCustomer, getCustomerOrders); // GET /order/my-orders

// Vendor views orders for their firm (open for now, add verifyToken if needed)
router.get('/firm/:firmId', getFirmOrders);                // GET /order/firm/:firmId

// Update order status — called by vendor dashboard
router.patch('/:orderId/status', updateOrderStatus);       // PATCH /order/:orderId/status

// Get a specific order by ID — for order tracking page
router.get('/:orderId', getOrderById);                     // GET /order/:orderId

module.exports = router;
