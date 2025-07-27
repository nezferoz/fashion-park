const db = require('../config/db');

const getAllProducts = async () => {
  const [rows] = await db.query(
    `SELECT p.*, c.category_name,
      (SELECT image_id FROM product_images WHERE product_id = p.product_id ORDER BY image_id ASC LIMIT 1) as main_image_id,
      COALESCE((SELECT SUM(stock_quantity) FROM product_variants WHERE product_id = p.product_id), 0) as total_stock
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.category_id
    ORDER BY p.product_name`
  );
  return rows;
};

const getProductById = async (id) => {
  const [rows] = await db.query(
    `SELECT p.*, c.category_name FROM products p LEFT JOIN categories c ON p.category_id = c.category_id WHERE p.product_id = ?`,
    [id]
  );
  return rows[0];
};

const getProductWithVariantsById = async (id) => {
  const product = await getProductById(id);
  if (!product) return null;
  const [variants] = await db.query(
    `SELECT * FROM product_variants WHERE product_id = ?`,
    [id]
  );
  product.variants = variants;
  const images = await getProductImages(id);
  product.images = images;
  return product;
};

const createProduct = async (product) => {
  const { product_name, description, price, stock_quantity, barcode, category_id, is_active } = product;
  const [result] = await db.query(
    `INSERT INTO products (product_name, description, price, stock_quantity, barcode, category_id, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [product_name, description, price, stock_quantity, barcode, category_id, is_active ?? true]
  );
  return result.insertId;
};

const updateProduct = async (id, product) => {
  const { product_name, description, price, stock_quantity, barcode, category_id, is_active } = product;
  await db.query(
    `UPDATE products SET product_name=?, description=?, price=?, stock_quantity=?, barcode=?, category_id=?, is_active=? WHERE product_id=?`,
    [product_name, description, price, stock_quantity, barcode, category_id, is_active ?? true, id]
  );
};

const deleteProduct = async (id) => {
  await db.query('DELETE FROM products WHERE product_id = ?', [id]);
};

const addProductImage = async (product_id, imageBuffer, mimeType) => {
  const [result] = await db.query(
    `INSERT INTO product_images (product_id, image, mime_type) VALUES (?, ?, ?)`,
    [product_id, imageBuffer, mimeType]
  );
  return result.insertId;
};

const getProductImages = async (product_id) => {
  const [rows] = await db.query(
    `SELECT image_id, mime_type FROM product_images WHERE product_id = ? ORDER BY image_id ASC`,
    [product_id]
  );
  return rows.map(img => ({ ...img, url: `/api/products/images/${img.image_id}` }));
};

const getProductImageById = async (image_id) => {
  const [rows] = await db.query(
    `SELECT image, mime_type FROM product_images WHERE image_id = ?`,
    [image_id]
  );
  return rows[0];
};

const updateVariantStock = async (variant_id, delta) => {
  await db.query(
    `UPDATE product_variants SET stock_quantity = stock_quantity + ? WHERE variant_id = ?`,
    [delta, variant_id]
  );
};

const addProductVariant = async (product_id, size, stock_quantity) => {
  const [result] = await db.query(
    `INSERT INTO product_variants (product_id, size, stock_quantity) VALUES (?, ?, ?)`,
    [product_id, size, stock_quantity]
  );
  return result.insertId;
};

const updateProductVariant = async (variant_id, size, stock_quantity) => {
  await db.query(
    `UPDATE product_variants SET size=?, stock_quantity=? WHERE variant_id=?`,
    [size, stock_quantity, variant_id]
  );
};

const deleteProductVariant = async (variant_id) => {
  await db.query(
    `DELETE FROM product_variants WHERE variant_id=?`,
    [variant_id]
  );
};

const deleteProductImageById = async (image_id) => {
  await db.query('DELETE FROM product_images WHERE image_id = ?', [image_id]);
};

// Ambil semua varian untuk banyak produk sekaligus
const getVariantsByProductIds = async (productIds) => {
  if (!productIds || productIds.length === 0) return [];
  const [rows] = await db.query(
    `SELECT * FROM product_variants WHERE product_id IN (${productIds.map(() => '?').join(',')})`,
    productIds
  );
  return rows;
};

module.exports = {
  getAllProducts,
  getProductById,
  getProductWithVariantsById,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductImage,
  getProductImages,
  getProductImageById,
  updateVariantStock,
  addProductVariant,
  updateProductVariant,
  deleteProductVariant,
  deleteProductImageById,
  getVariantsByProductIds, // <--- export fungsi baru
}; 