const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const auth = require('../middlewares/auth');

router.get('/', auth, cartController.getByUserId);
router.post('/', auth, cartController.addOrUpdate);
router.delete('/item', auth, cartController.remove);
router.delete('/clear', auth, cartController.clear);

module.exports = router; 