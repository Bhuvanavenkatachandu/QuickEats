// ============================================================
//  customerRoutes.js — API Routes for Customer Actions
//  Routes tell Express WHICH function to call for each URL.
//  Format: router.METHOD('/path', middlewareFn, controllerFn)
// ============================================================

const express = require('express');
const router = express.Router();
const { customerRegister, customerLogin, getCustomerProfile } = require('../controllers/customerController');
const verifyCustomer = require('../middlewares/verifyCustomer');

// Public routes — no login required
router.post('/register', customerRegister);   // POST /customer/register
router.post('/login', customerLogin);          // POST /customer/login

// Protected routes — must be logged in (verifyCustomer checks the token)
router.get('/profile', verifyCustomer, getCustomerProfile); // GET /customer/profile

module.exports = router;
