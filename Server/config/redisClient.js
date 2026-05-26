// ============================================================
//  redisClient.js — Redis Connection Setup
//  Redis is a super-fast in-memory database used for CACHING.
//  Caching means: store a result temporarily so next time we
//  don't hit MongoDB again — much faster responses!
// ============================================================

const { createClient } = require('redis');
const dotenv = require('dotenv');
dotenv.config();

// Create the Redis client using credentials stored in .env file
const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT)
    }
});

// Log any Redis errors so we can debug them
redisClient.on('error', (err) => {
    console.error('❌ Redis Client Error:', err.message);
});

redisClient.on('connect', () => {
    console.log('✅ Redis connected successfully!');
});

// Connect to Redis — we call this function once when the server starts
const connectRedis = async () => {
    try {
        await redisClient.connect();
    } catch (err) {
        console.error('❌ Redis connection failed:', err.message);
    }
};

connectRedis(); // Auto-connect when this file is imported

module.exports = redisClient;
