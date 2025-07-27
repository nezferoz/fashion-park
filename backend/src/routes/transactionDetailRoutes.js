const express = require('express');
const router = express.Router();
const detailController = require('../controllers/transactionDetailController');

router.get('/:transaction_id', detailController.getByTransactionId);
router.post('/', detailController.createMany);

module.exports = router; 