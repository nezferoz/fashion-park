const express = require('express');
const router = express.Router();
const binderbyteController = require('../controllers/binderbyteController');

// BinderByte routes
router.get('/track', binderbyteController.trackWaybill);

module.exports = router;
