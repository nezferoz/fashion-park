const cartModel = require('../models/cartModel');

const getByUserId = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const cart = await cartModel.getCartByUserId(user_id);
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil cart', error: err.message });
  }
};

const addOrUpdate = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { product_id, variant_id, quantity } = req.body;
    if (!product_id || !variant_id || !quantity) return res.status(400).json({ message: 'product_id, variant_id, quantity wajib diisi' });
    await cartModel.addOrUpdateCart(user_id, product_id, variant_id, quantity);
    res.status(201).json({ message: 'Cart diupdate' });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Gagal update cart' });
  }
};

const remove = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { product_id, variant_id } = req.body;
    await cartModel.removeCartItem(user_id, product_id, variant_id);
    res.json({ message: 'Item cart dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal hapus item cart', error: err.message });
  }
};

const clear = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    await cartModel.clearCart(user_id);
    res.json({ message: 'Cart dikosongkan' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal kosongkan cart', error: err.message });
  }
};

module.exports = { getByUserId, addOrUpdate, remove, clear }; 