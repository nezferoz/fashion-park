const express = require('express');
const router = express.Router();
const midtransClient = require('midtrans-client');
const transactionModel = require('../models/transactionModel');

const snap = new midtransClient.Snap({
  isProduction: true, // Ubah ke true agar transaksi masuk ke Production
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

const core = new midtransClient.CoreApi({
  isProduction: true, // Ubah ke true agar transaksi masuk ke Production
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

// Endpoint untuk membuat transaksi Snap (semua channel)
router.post('/midtrans', async (req, res) => {
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
    if (err.response && err.response.data) {
      console.error('Midtrans API error:', err.response.data);
    } else {
      console.error('Midtrans error:', err.message || err);
    }
    res.status(500).json({ message: 'Gagal membuat transaksi Midtrans', error: err.message });
  }
});

// Endpoint khusus QRIS (langsung barcode, tanpa Snap)
router.post('/qris', async (req, res) => {
  try {
    const { order_id, gross_amount } = req.body;
    const parameter = {
      payment_type: 'qris',
      transaction_details: {
        order_id,
        gross_amount: Number(gross_amount),
      },
      qris: {},
    };
    const chargeResponse = await core.charge(parameter);
    // qr_string adalah string QRIS yang valid untuk di-scan
    res.json({ qr_string: chargeResponse.qr_string, response: chargeResponse });
  } catch (err) {
    if (err.response && err.response.data) {
      console.error('Midtrans QRIS API error:', err.response.data);
    } else {
      console.error('Midtrans QRIS error:', err.message || err);
    }
    res.status(500).json({ message: 'Gagal membuat transaksi QRIS', error: err.message });
  }
});

// Endpoint untuk membuat transaksi BCA Virtual Account (VA)
router.post('/va', async (req, res) => {
  try {
    const { order_id, gross_amount, customer, bank } = req.body;
    const parameter = {
      payment_type: 'bank_transfer',
      transaction_details: {
        order_id,
        gross_amount: Number(gross_amount),
      },
      bank_transfer: {
        bank: bank || 'bca', // default ke BCA
      },
      customer_details: customer,
    };
    const chargeResponse = await core.charge(parameter);
    res.json(chargeResponse);
  } catch (err) {
    if (err.response && err.response.data) {
      console.error('Midtrans VA API error:', err.response.data);
      res.status(500).json({ message: 'Gagal membuat transaksi VA', error: err.response.data });
    } else {
      console.error('Midtrans VA error:', err.message || err);
      res.status(500).json({ message: 'Gagal membuat transaksi VA', error: err.message });
    }
  }
});

// Endpoint untuk menerima notifikasi/callback dari Midtrans
router.post('/midtrans-callback', express.json(), async (req, res) => {
  console.log('==== MIDTRANS CALLBACK BODY ====', JSON.stringify(req.body, null, 2));
  try {
    const { order_id, transaction_status, fee_amount } = req.body;
    if (!order_id || !transaction_status) {
      console.error('MIDTRANS CALLBACK ERROR: order_id atau transaction_status tidak ada di body!');
      return res.status(400).json({ message: 'order_id atau transaction_status tidak ada di body!' });
    }
    await transactionModel.updateMidtransFeeAndStatus(order_id, Number(fee_amount || 0), transaction_status);
    res.status(200).json({ message: 'Notifikasi diterima' });
  } catch (err) {
    console.error('==== MIDTRANS CALLBACK ERROR ====', err);
    res.status(500).json({ message: 'Gagal memproses notifikasi Midtrans', error: err.message });
  }
});

module.exports = router; 