const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middlewares/auth');
const authorizeRoles = require('../middlewares/role');

router.get('/', auth, authorizeRoles('owner', 'admin'), reportController.getAll); // ?type=daily|monthly|yearly|finance
router.get('/sales', auth, authorizeRoles('owner'), reportController.getSalesReport);
router.get('/best-sellers', auth, authorizeRoles('owner'), reportController.getBestSellersReport);
router.post('/', auth, authorizeRoles('owner', 'admin'), reportController.create);
router.get('/finance-summary', auth, authorizeRoles('owner'), reportController.getFinanceSummary);

module.exports = router; 