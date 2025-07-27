const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const auth = require('../middlewares/auth');
const authorizeRoles = require('../middlewares/role');

router.get('/', auth, authorizeRoles('owner', 'admin', 'pelanggan', 'kasir'), transactionController.getAll);
router.get('/:id', auth, authorizeRoles('owner', 'admin', 'kasir'), transactionController.getById);
router.post('/', auth, authorizeRoles('owner', 'admin', 'kasir'), transactionController.create);
router.get('/status/:order_id', transactionController.getStatusByOrderId);

module.exports = router; 