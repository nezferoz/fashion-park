const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const auth = require('../middlewares/auth');
const authorizeRoles = require('../middlewares/role');

router.get('/', auth, authorizeRoles('owner', 'admin', 'pelanggan', 'kasir'), transactionController.getAll);
router.get('/success', auth, authorizeRoles('owner', 'admin', 'pelanggan', 'kasir'), transactionController.getSuccessTransactions);
router.get('/kasir', auth, authorizeRoles('kasir'), transactionController.getByKasirId);
router.get('/admin/online', auth, authorizeRoles('admin'), transactionController.getOnlineTransactionsForAdmin);
router.get('/web-only', auth, authorizeRoles('admin', 'owner'), transactionController.getWebOnlyTransactions);
router.get('/dashboard-stats', auth, authorizeRoles('admin', 'owner'), transactionController.getDashboardStats);
router.get('/kpi', auth, authorizeRoles('admin', 'owner'), transactionController.getKPIData);
router.get('/user/:userId', transactionController.getByUserId);
router.get('/status/:order_id', transactionController.getStatusByOrderId);
router.get('/:id/details', auth, authorizeRoles('owner', 'admin', 'kasir'), transactionController.getTransactionDetails);
router.get('/:id/details/user', auth, transactionController.getTransactionDetailsForUser);
router.get('/:id', auth, authorizeRoles('owner', 'admin', 'kasir'), transactionController.getById);
router.post('/', auth, authorizeRoles('owner', 'admin', 'kasir'), transactionController.create);

// Update order status and resi
router.put('/:transaction_id', auth, authorizeRoles('admin', 'owner'), transactionController.updateOrder);

module.exports = router; 