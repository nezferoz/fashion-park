const express = require('express');
const app = require('./app');
require('dotenv').config();
const midtransClient = require('midtrans-client');
const transactionModel = require('./models/transactionModel');

const PORT = process.env.PORT || 5000;

const snap = new midtransClient.Snap({
  isProduction: false, // Ganti true jika sudah live
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

// Endpoint untuk membuat transaksi Snap
app.post('/api/payment/midtrans', async (req, res) => {
  try {
    const { order_id, gross_amount, customer } = req.body;
    const parameter = {
      transaction_details: {
        order_id,
        gross_amount: Number(gross_amount),
      },
      customer_details: customer,
    };
    const transaction = await snap.createTransaction(parameter);
    res.json({ token: transaction.token, redirect_url: transaction.redirect_url });
  } catch (err) {
    res.status(500).json({ message: 'Gagal membuat transaksi Midtrans', error: err.message });
  }
});

// Endpoint untuk menerima notifikasi/callback dari Midtrans
app.post('/api/payment/midtrans-callback', express.json(), async (req, res) => {
  try {
    const { order_id, transaction_status, fee_amount } = req.body;
    // fee_amount bisa berbeda nama tergantung response Midtrans, sesuaikan jika perlu
    await transactionModel.updateMidtransFeeAndStatus(order_id, Number(fee_amount || 0), transaction_status);
    res.status(200).json({ message: 'Notifikasi diterima' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal memproses notifikasi Midtrans', error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 