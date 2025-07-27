const productModel = require('../models/productModel');
const multer = require('multer');
const upload = multer();

const getAll = async (req, res) => {
  try {
    const products = await productModel.getAllProducts();
    // Ambil semua product_id
    const productIds = products.map(p => p.product_id);
    // Ambil semua varian sekaligus
    const allVariants = await productModel.getVariantsByProductIds(productIds);
    // Gabungkan variants ke masing-masing produk
    const productsWithVariants = products.map(p => ({
      ...p,
      variants: allVariants.filter(v => v.product_id === p.product_id)
    }));
    res.json(productsWithVariants);
  } catch (err) {
    console.error('GET ALL PRODUCTS ERROR:', err); // Pastikan baris ini ada!
    res.status(500).json({ message: 'Gagal mengambil produk', error: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    let product = await productModel.getProductWithVariantsById(id);
    if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });
    // Pastikan images selalu ada
    if (!product.images) {
      const images = await productModel.getProductImages(id);
      product.images = images;
    }
    console.log('PRODUCT DETAIL:', product); // Debug log
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil produk', error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const id = await productModel.createProduct(req.body);
    res.status(201).json({ message: 'Produk ditambahkan', product_id: id });
  } catch (err) {
    console.error('CREATE PRODUCT ERROR:', err);
    res.status(500).json({ message: 'Gagal menambah produk', error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    await productModel.updateProduct(id, req.body);
    res.json({ message: 'Produk diupdate' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal update produk', error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    await productModel.deleteProduct(id);
    res.json({ message: 'Produk dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal hapus produk', error: err.message });
  }
};

// Upload multiple images for a product
const uploadImages = [
  upload.array('images'),
  async (req, res) => {
    try {
      const { id } = req.params;
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No images uploaded' });
      }
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        await productModel.addProductImage(id, file.buffer, file.mimetype, i);
      }
      res.status(201).json({ message: 'Images uploaded' });
    } catch (err) {
      console.error('UPLOAD IMAGE ERROR:', err); // Tambahkan log error detail
      res.status(500).json({ message: 'Gagal upload gambar', error: err.message });
    }
  }
];

// Get all image ids for a product
const getImages = async (req, res) => {
  try {
    const { id } = req.params;
    const images = await productModel.getProductImages(id);
    res.json(images);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil gambar', error: err.message });
  }
};

// Get image binary by image_id
const getImageById = async (req, res) => {
  try {
    const { image_id } = req.params;
    const image = await productModel.getProductImageById(image_id);
    if (!image) return res.status(404).json({ message: 'Gambar tidak ditemukan' });
    res.set('Content-Type', image.mime_type);
    res.send(image.image);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil gambar', error: err.message });
  }
};

const addVariant = async (req, res) => {
  try {
    const { product_id, size, stock_quantity } = req.body;
    const id = await productModel.addProductVariant(product_id, size, stock_quantity);
    res.status(201).json({ message: 'Varian ditambahkan', variant_id: id });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menambah varian', error: err.message });
  }
};

const updateVariant = async (req, res) => {
  try {
    const { variant_id, size, stock_quantity } = req.body;
    await productModel.updateProductVariant(variant_id, size, stock_quantity);
    res.json({ message: 'Varian diupdate' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal update varian', error: err.message });
  }
};

const deleteVariant = async (req, res) => {
  try {
    const { variant_id } = req.params;
    await productModel.deleteProductVariant(variant_id);
    res.json({ message: 'Varian dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal hapus varian', error: err.message });
  }
};

const deleteImageById = async (req, res) => {
  try {
    const { image_id } = req.params;
    await productModel.deleteProductImageById(image_id);
    res.json({ message: 'Gambar dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal hapus gambar', error: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove, uploadImages, getImages, getImageById, addVariant, updateVariant, deleteVariant, deleteImageById }; 