const express = require('express');
const router = express.Router();
const apiKeyController = require('../controllers/apiKeyController');
const auth = require('../middlewares/auth');
const authorizeRoles = require('../middlewares/role');

// Get all API keys (admin only)
router.get('/', auth, authorizeRoles('admin', 'owner'), apiKeyController.getApiKeys);

// Get specific API key
router.get('/:service', auth, authorizeRoles('admin', 'owner'), apiKeyController.getApiKey);

// Create new API key
router.post('/', auth, authorizeRoles('admin', 'owner'), apiKeyController.createApiKey);

// Update API key
router.put('/:id', auth, authorizeRoles('admin', 'owner'), apiKeyController.updateApiKey);

// Deactivate API key
router.delete('/:id', auth, authorizeRoles('admin', 'owner'), apiKeyController.deactivateApiKey);

// Test RajaOngkir API
router.get('/test/rajaongkir', auth, authorizeRoles('admin', 'owner'), apiKeyController.testRajaOngkirApi);

module.exports = router; 