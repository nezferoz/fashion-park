const transactionModel = require('../models/transactionModel');

const getAll = async (req, res) => {
  try {
    let transactions;
    if (req.user.role === 'pelanggan') {
      transactions = await transactionModel.getAllTransactionsByUserId(req.user.user_id);
    } else {
      transactions = await transactionModel.getAllTransactions();
    }
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil transaksi', error: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const trx = await transactionModel.getTransactionById(id);
    if (!trx) return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    res.json(trx);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil transaksi', error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const id = await transactionModel.createTransaction(req.body);
    res.status(201).json({ message: 'Transaksi ditambahkan', transaction_id: id });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menambah transaksi', error: err.message });
  }
};

const getStatusByOrderId = async (req, res) => {
  try {
    const { order_id } = req.params;
    const trx = await transactionModel.getByOrderId(order_id);
    if (!trx) return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    res.json({ transaction_status: trx.midtrans_status, transaction: trx });
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil status transaksi', error: err.message });
  }
};

module.exports = { getAll, getById, create, getStatusByOrderId }; 