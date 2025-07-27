const express = require('express');
const router = express.Router();
const paymentLogController = require('../controllers/paymentLogController');

router.get('/:transaction_id', paymentLogController.getByTransactionId);
router.post('/', paymentLogController.create);

module.exports = router; 