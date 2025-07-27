const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockMovementController');

router.get('/:product_id', stockController.getByProductId);
router.post('/', stockController.create);
router.get('/', stockController.getAll);
router.delete('/:id', stockController.deleteMovement);

module.exports = router; 