const express = require('express');
const router = express.Router();
const rajaongkirController = require('../controllers/rajaongkirController');
const auth = require('../middlewares/auth');
const authorizeRoles = require('../middlewares/role');

// RajaOngkir routes
router.get('/provinces', rajaongkirController.getProvinces);
router.get('/cities', rajaongkirController.getCities);
router.get('/districts', rajaongkirController.getDistricts);
router.get('/villages', rajaongkirController.getVillages);
router.get('/postalcodes', rajaongkirController.getPostalcodes);
router.get('/subdistricts', rajaongkirController.getSubdistricts);
router.get('/couriers', rajaongkirController.getCouriers);
router.post('/cost', auth, rajaongkirController.getShippingCost);

// Alamat pengirim (semua user bisa akses untuk melihat)
router.get('/sender-address', auth, rajaongkirController.getSenderAddress);
router.put('/sender-address', auth, authorizeRoles('admin', 'pemilik'), rajaongkirController.updateSenderAddress);

// Endpoint pencarian lokasi autocomplete
router.get('/search-location', rajaongkirController.searchLocation);


module.exports = router; 