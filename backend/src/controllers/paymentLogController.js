const paymentLogModel = require('../models/paymentLogModel');

const getByTransactionId = async (req, res) => {
  try {
    const { transaction_id } = req.params;
    const logs = await paymentLogModel.getLogsByTransactionId(transaction_id);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil log pembayaran', error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const id = await paymentLogModel.createLog(req.body);
    res.status(201).json({ message: 'Log pembayaran ditambahkan', log_id: id });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menambah log pembayaran', error: err.message });
  }
};

module.exports = { getByTransactionId, create }; 