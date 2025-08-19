const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middlewares/auth');
const authorizeRoles = require('../middlewares/role');

router.get('/', productController.getAll);
router.get('/low-stock', auth, authorizeRoles('admin', 'owner'), productController.getLowStockProducts);
// Handle CORS preflight untuk images
router.options('/images/:image_id', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'ngrok-skip-browser-warning, Content-Type, Authorization');
  res.status(200).end();
});

router.get('/images/:image_id', productController.getImageById);
router.get('/:id/images', productController.getImages);
router.get('/:id', productController.getById);
router.post('/', auth, authorizeRoles('admin', 'owner', 'kasir'), productController.create);
router.put('/:id', auth, authorizeRoles('admin', 'owner', 'kasir'), productController.update);
router.delete('/:id', auth, authorizeRoles('admin', 'owner', 'kasir'), productController.remove);

// Tambahan untuk gambar produk
router.post('/:id/images', auth, authorizeRoles('admin', 'owner', 'kasir'), productController.uploadImages);
router.delete('/images/:image_id', auth, authorizeRoles('admin', 'owner', 'kasir'), productController.deleteImageById);

router.post('/:id/variants', auth, authorizeRoles('admin', 'owner', 'kasir'), productController.addVariant);
router.put('/variants/:variant_id', auth, authorizeRoles('admin', 'owner', 'kasir'), productController.updateVariant);
router.delete('/variants/:variant_id', auth, authorizeRoles('admin', 'owner', 'kasir'), productController.deleteVariant);

router.post('/print-barcodes-horizontal', auth, authorizeRoles('admin', 'owner', 'kasir'), productController.printBarcodesHorizontal);

// Stock management routes
router.put('/:id/stock', auth, authorizeRoles('admin', 'owner', 'kasir'), productController.updateStock);

// Image management routes
router.post('/:id/default-image', auth, authorizeRoles('admin', 'owner', 'kasir'), productController.createDefaultImage);

module.exports = router; 