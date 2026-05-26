// ============================================================
//  server.js — Main Entry Point for the QuickEats Backend
//
//  This file does 4 key things:
//  1. Sets up Express (the web server framework)
//  2. Connects to MongoDB (main database)
//  3. Connects to Redis (caching layer - makes APIs 30% faster)
//  4. Sets up Socket.io (real-time order tracking notifications)
//
//  How a request flows:
//  Browser → server.js → route file → middleware → controller → MongoDB/Redis
// ============================================================

const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const http = require('http');       // Node's built-in HTTP module
const { Server } = require('socket.io'); // Real-time communication
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
// Trigger restart

dotenv.config({ override: true });

// ── Import Route Files ──
const vendorRoutes = require('./routes/vendorRoutes');
const firmRoutes = require('./routes/firmRoutes');
const productRoutes = require('./routes/productRoutes');
const customerRoutes = require('./routes/customerRoutes');
const orderRoutes = require('./routes/orderRoutes');

// ── Import Redis Client ──
// Just importing it triggers the connection (see config/redisClient.js)
require('./config/redisClient');

// ── Create Express App ──
const app = express();

// ── Create HTTP Server from Express ──
// We need this to attach Socket.io (Socket.io works on top of HTTP)
const server = http.createServer(app);

// ── Set Up Socket.io (Real-time Communication) ──
const io = new Server(server, {
    cors: {
        origin: '*',  // Allow all origins (in production, set your frontend URL)
        methods: ['GET', 'POST', 'PATCH', 'DELETE']
    }
});

// Make io accessible inside controllers via: req.app.get('io')
app.set('io', io);

const PORT = process.env.PORT || 4000;

// ─── Middleware ──────────────────────────────────────────────
app.use(cors());                        // Allow cross-origin requests (frontend can call this API)
app.use(bodyParser.json());             // Parse incoming JSON request bodies
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded images

// ─── API Routes ─────────────────────────────────────────────
// All vendor-related endpoints: register, login, get vendors
app.use('/vendor', vendorRoutes);

// All firm/restaurant endpoints: add firm, delete firm
app.use('/firm', firmRoutes);

// All product endpoints: add product, get products, delete product
app.use('/product', productRoutes);

// All customer endpoints: register, login, profile
app.use('/customer', customerRoutes);

// All order endpoints: place order, view orders, update status
app.use('/order', orderRoutes);

// ─── Health Check Route ─────────────────────────────────────
app.get('/', (req, res) => {
    res.json({
        message: '🍔 QuickEats API is running!',
        version: '1.0.0',
        endpoints: {
            vendor: '/vendor',
            firm: '/firm',
            product: '/product',
            customer: '/customer',
            order: '/order'
        }
    });
});

// ─── Socket.io Real-Time Event Handlers ─────────────────────
// Socket.io enables INSTANT communication between server and browser.
// Think of it like a phone call — once connected, both sides can
// send messages to each other at any time.

io.on('connection', (socket) => {
    console.log(`🔌 New socket connection: ${socket.id}`);

    // Customer joins their own private "room" to receive their order updates
    // A "room" is like a private chat channel
    socket.on('join_customer', (customerId) => {
        socket.join(`customer_${customerId}`);
        console.log(`✅ Customer joined room: customer_${customerId}`);
    });

    // Vendor joins their restaurant's room to receive new order notifications
    socket.on('join_firm', (firmId) => {
        socket.join(`firm_${firmId}`);
        console.log(`✅ Vendor joined room: firm_${firmId}`);
    });

    // When someone disconnects (closes browser, etc.)
    socket.on('disconnect', () => {
        console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
});

// ─── Connect to MongoDB ──────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connected successfully!'))
    .catch((error) => {
        console.error('❌ MongoDB connection failed:', error.message);
    });

// ─── Start the Server ────────────────────────────────────────
// Use server.listen (not app.listen) so Socket.io works correctly!
server.listen(PORT, () => {
    console.log(`🚀 QuickEats server running at http://localhost:${PORT}`);
    console.log(`📦 MongoDB: connecting...`);
    console.log(`⚡ Redis: connecting...`);
});