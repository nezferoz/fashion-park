const detailModel = require('../models/transactionDetailModel');

const getByTransactionId = async (req, res) => {
  try {
    const { transaction_id } = req.params;
    const details = await detailModel.getDetailsByTransactionId(transaction_id);
    res.json(details);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil detail transaksi', error: err.message });
  }
};

const createMany = async (req, res) => {
  try {
    const { transaction_id, details } = req.body;
    if (!transaction_id || !Array.isArray(details)) {
      return res.status(400).json({ message: 'transaction_id dan details array wajib diisi' });
    }
    await detailModel.createDetails(transaction_id, details);
    res.status(201).json({ message: 'Detail transaksi ditambahkan' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menambah detail transaksi', error: err.message });
  }
};

module.exports = { getByTransactionId, createMany }; 