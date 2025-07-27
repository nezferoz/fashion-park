const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');
const authorizeRoles = require('../middlewares/role');

router.get('/', auth, authorizeRoles('owner', 'admin'), userController.getAllUsers);
router.get('/:id', auth, userController.getUserById);
router.put('/:id', auth, authorizeRoles('owner', 'admin'), userController.updateUser);
router.delete('/:id', auth, authorizeRoles('owner'), userController.deleteUser);

module.exports = router; 