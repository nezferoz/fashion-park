const express = require('express');
const router = express.Router();
const shippingController = require('../controllers/shippingController');
const auth = require('../middlewares/auth');

// Hitung ongkir (dummy)
router.post('/cost', auth, shippingController.getCost);

module.exports = router; 