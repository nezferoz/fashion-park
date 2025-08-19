const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');
const authorizeRoles = require('../middlewares/role');

router.get('/', auth, authorizeRoles('admin'), userController.getAllUsers);
router.get('/count', auth, authorizeRoles('admin'), userController.getUserCount);
router.get('/kasir-pelanggan', auth, authorizeRoles('admin'), userController.getKasirPelangganUsers);
router.get('/admin-only', auth, authorizeRoles('admin'), userController.getAdminOnlyUsers);
router.get('/profile', auth, userController.getProfile);
router.get('/:id', auth, userController.getUserById);
router.post('/', auth, authorizeRoles('admin'), userController.createUser);
router.put('/:id', auth, userController.updateUser);
router.patch('/:id/status', auth, authorizeRoles('admin'), userController.toggleUserStatus);
router.delete('/:id', auth, authorizeRoles('admin'), userController.deleteUser);

module.exports = router; 