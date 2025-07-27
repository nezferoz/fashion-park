const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getAll);
router.get('/:id', productController.getById);
router.post('/', productController.create);
router.put('/:id', productController.update);
router.delete('/:id', productController.remove);

// Tambahan untuk gambar produk
router.post('/:id/images', productController.uploadImages);
router.get('/:id/images', productController.getImages);
router.get('/images/:image_id', productController.getImageById);
router.delete('/images/:image_id', productController.deleteImageById);

router.post('/:id/variants', productController.addVariant);
router.put('/variants/:variant_id', productController.updateVariant);
router.delete('/variants/:variant_id', productController.deleteVariant);

module.exports = router; 