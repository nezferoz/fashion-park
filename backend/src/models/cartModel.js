const db = require('../config/db');
const productModel = require('./productModel');

const getCartByUserId = async (user_id) => {
  const [rows] = await db.query(
    `SELECT c.*, p.product_name, p.price, v.size, v.stock_quantity,
      (SELECT image_id FROM product_images WHERE product_id = p.product_id LIMIT 1) as image_id
     FROM cart c 
     JOIN products p ON c.product_id = p.product_id 
     JOIN product_variants v ON c.variant_id = v.variant_id 
     WHERE c.user_id = ?`,
    [user_id]
  );
  return rows;
};

const addOrUpdateCart = async (user_id, product_id, variant_id, quantity) => {
  // Validasi stok berdasarkan variant
  const [variantRows] = await db.query(
    `SELECT * FROM product_variants WHERE variant_id = ? AND product_id = ?`,
    [variant_id, product_id]
  );
  const variant = variantRows[0];
  if (!variant) throw new Error('Varian produk tidak ditemukan');
  const maxQty = variant.stock_quantity;
  if (quantity > maxQty) {
    throw new Error('Jumlah melebihi stok tersedia');
  }
  const safeQty = Math.max(1, quantity);

  // Cek apakah item sudah ada
  const [rows] = await db.query(
    `SELECT * FROM cart WHERE user_id = ? AND product_id = ? AND variant_id = ?`,
    [user_id, product_id, variant_id]
  );
  if (rows.length > 0) {
    // Set quantity (bukan tambah)
    await db.query(
      `UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ? AND variant_id = ?`,
      [safeQty, user_id, product_id, variant_id]
    );
  } else {
    // Insert baru
    await db.query(
      `INSERT INTO cart (user_id, product_id, variant_id, quantity) VALUES (?, ?, ?, ?)`,
      [user_id, product_id, variant_id, safeQty]
    );
  }
};

const removeCartItem = async (user_id, product_id, variant_id) => {
  await db.query(
    `DELETE FROM cart WHERE user_id = ? AND product_id = ? AND variant_id = ?`,
    [user_id, product_id, variant_id]
  );
};

const clearCart = async (user_id) => {
  await db.query(
    `DELETE FROM cart WHERE user_id = ?`,
    [user_id]
  );
};

module.exports = { getCartByUserId, addOrUpdateCart, removeCartItem, clearCart }; 