const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const auth = require('../middlewares/auth');
const authorizeRoles = require('../middlewares/role');

router.get('/', categoryController.getAll);
router.post('/', auth, authorizeRoles('admin', 'pemilik'), categoryController.create);
router.put('/:id', auth, authorizeRoles('admin', 'pemilik'), categoryController.update);
router.delete('/:id', auth, authorizeRoles('admin', 'pemilik'), categoryController.remove);

module.exports = router; 