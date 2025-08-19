require('dotenv').config({ path: './config.env' });
const express = require('express');
const app = require('./app');

const PORT = process.env.PORT || 5000;

// Endpoint Midtrans callback
app.post('/api/payment/midtrans-callback', express.json(), async (req, res) => {
  try {
    const { order_id, transaction_status, fee_amount } = req.body;
    const transactionModel = require('./models/transactionModel');
    await transactionModel.updateMidtransFeeAndStatus(order_id, Number(fee_amount || 0), transaction_status);
    res.status(200).json({ message: 'Notifikasi diterima' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal memproses notifikasi Midtrans', error: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌐 Server also accessible on http://0.0.0.0:${PORT}`);
  console.log(`📱 Frontend should connect to: http://localhost:${PORT}`);
});
