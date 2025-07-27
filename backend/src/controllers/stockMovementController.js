const stockModel = require('../models/stockMovementModel');
const productModel = require('../models/productModel');

const getByProductId = async (req, res) => {
  try {
    const { product_id } = req.params;
    const movements = await stockModel.getMovementsByProductId(product_id);
    res.json(movements);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil mutasi stok', error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const id = await stockModel.createMovement(req.body);
    // Update stok di product_variants
    const { product_id, variant_id, movement_type, quantity } = req.body;
    if (product_id && variant_id && movement_type && quantity) {
      await productModel.updateVariantStock(variant_id, movement_type === 'in' ? quantity : -quantity);
    }
    res.status(201).json({ message: 'Mutasi stok ditambahkan', movement_id: id });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menambah mutasi stok', error: err.message });
  }
};

const getAll = async (req, res) => {
  try {
    const movements = await stockModel.getAllMovements();
    res.json(movements);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data stok', error: err.message });
  }
};

const deleteMovement = async (req, res) => {
  try {
    const { id } = req.params;
    // Ambil data movement sebelum dihapus
    const [movementRows] = await require('../config/db').query('SELECT * FROM stock_movements WHERE movement_id = ?', [id]);
    const movement = movementRows[0];
    if (movement && movement.variant_id && movement.quantity) {
      // Jika movement_type 'in', maka hapus = kurangi stok; jika 'out', maka hapus = tambah stok
      const delta = movement.movement_type === 'in' ? -movement.quantity : movement.quantity;
      await productModel.updateVariantStock(movement.variant_id, delta);
    }
    await stockModel.deleteMovement(id);
    res.json({ message: 'Stok berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menghapus stok', error: err.message });
  }
};

module.exports = { getByProductId, create, getAll, deleteMovement }; 