const express = require('express');
const router = express.Router();
const rajaongkirController = require('../controllers/rajaongkirController');
const auth = require('../middlewares/auth');

router.get('/provinces', auth, rajaongkirController.getProvinces);
router.get('/cities', auth, rajaongkirController.getCities);

module.exports = router; 