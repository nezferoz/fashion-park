const express = require('express');
const router = express.Router();
const midtransClient = require('midtrans-client');
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const BACKEND_URL = process.env.BACKEND_URL || 'https://d6b8dab732e7.ngrok-free.app';
const IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true';

// Parse enabled banks from env, fallback to commonly activated banks
// Example env: MIDTRANS_ENABLED_BANKS="bni,bri,mandiri,permata,cimb"
function getEnabledBankVaCodes() {
  const envBanks = (process.env.MIDTRANS_ENABLED_BANKS || 'bni,bri,mandiri,permata,cimb')
    .split(',')
    .map(b => b.trim().toLowerCase())
    .filter(Boolean);

  const validBankMap = {
    bca: 'bca_va',
    bni: 'bni_va',
    bri: 'bri_va',
    mandiri: 'mandiri_va',
    permata: 'permata_va',
    cimb: 'cimb_va'
  };

  return envBanks
    .map(bank => validBankMap[bank])
    .filter(Boolean);
}

// Safe debug log
const obfuscate = (k) => (k ? `${k.slice(0, 8)}...${k.slice(-4)}` : 'MISSING');
console.log('Midtrans config:', {
  isProduction: IS_PRODUCTION,
  serverKey: obfuscate(process.env.MIDTRANS_SERVER_KEY || ''),
  clientKey: obfuscate(process.env.MIDTRANS_CLIENT_KEY || ''),
});
const transactionModel = require('../models/transactionModel');
const auth = require('../middlewares/auth');

// Midtrans clients will be initialized inside functions to ensure environment variables are loaded
let snap, core;

function initializeMidtransClients() {
  if (!snap || !core) {
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const clientKey = process.env.MIDTRANS_CLIENT_KEY;
    
    console.log('🔑 Initializing Midtrans clients with:');
    console.log('  Server Key:', serverKey ? `${serverKey.substring(0, 10)}...` : '❌ MISSING');
    console.log('  Client Key:', clientKey ? `${clientKey.substring(0, 10)}...` : '❌ MISSING');
    console.log('  Production:', IS_PRODUCTION);
    
    if (!serverKey || !clientKey) {
      throw new Error('Midtrans API keys not found in environment variables');
    }
    
    snap = new midtransClient.Snap({
      isProduction: IS_PRODUCTION,
      serverKey: serverKey,
      clientKey: clientKey,
    });
    
    core = new midtransClient.CoreApi({
      isProduction: IS_PRODUCTION,
      serverKey: serverKey,
      clientKey: clientKey,
    });
  }
  return { snap, core };
}

// Refund endpoint (admin only)
router.post('/refund', auth, async (req, res) => {
  try {
    if (!['admin','owner'].includes((req.user.role || '').toLowerCase())) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    const { order_id, amount, reason } = req.body;
    if (!order_id) return res.status(400).json({ message: 'order_id diperlukan' });
    
    // Initialize Midtrans clients
    const { core } = initializeMidtransClients();
    
    const refundPayload = amount ? { amount, reason } : { reason };
    const resp = await core.refund({ order_id, ...refundPayload });
    
    // Update status lokal
    await transactionModel.updateMidtransFeeAndStatus(order_id, 0, 'refund');
    res.json({ message: 'Refund diproses', midtrans: resp });
  } catch (err) {
    console.error('Refund error:', err);
    if (err.response && err.response.data) {
      return res.status(500).json({ message: 'Refund gagal', error: err.response.data });
    }
    res.status(500).json({ message: 'Refund gagal', error: err.message });
  }
});

// Endpoint untuk membuat transaksi Snap (semua channel)
router.post('/midtrans', auth, async (req, res) => {
  try {
    console.log('=== MIDTRANS REQUEST ===', {
      order_id: req.body.order_id,
      gross_amount: req.body.gross_amount,
      customer: req.body.customer,
      payment_type: req.body.payment_type
    });
    
    const { order_id, gross_amount, customer, payment_type, items } = req.body;
    
    // Validasi input
    if (!order_id || !gross_amount || !customer) {
      return res.status(400).json({ 
        message: 'Data tidak lengkap', 
        required: ['order_id', 'gross_amount', 'customer'] 
      });
    }
    
    // Tentukan enabled_payments berdasarkan payment_type sesuai panduan Midtrans
    let enabled_payments = [];
    const bankVaCodes = getEnabledBankVaCodes();
    if (payment_type === 'qris') {
      // QRIS dan GoPay sesuai panduan Midtrans
      enabled_payments = ['qris', 'gopay'];
    } else if (payment_type === 'bank_transfer') {
      // Bank Transfer - Virtual Account, batasi hanya bank yang diaktifkan di dashboard/env
      enabled_payments = bankVaCodes.length > 0 ? bankVaCodes : ['bni_va', 'bri_va', 'mandiri_va'];
    } else {
      // Default: metode umum + bank VA aktif
      enabled_payments = [...bankVaCodes, 'gopay', 'qris'];
    }
    
    const parameter = {
      transaction_details: {
        order_id,
        gross_amount: Number(gross_amount),
      },
      customer_details: customer,
      enabled_payments: enabled_payments, // Aktifkan enabled_payments sesuai panduan
      notification_url: `${BACKEND_URL}/api/payment/midtrans-callback`,
      callbacks: {
        finish: `${FRONTEND_URL}/pelanggan/status-pembayaran`,
        error: `${FRONTEND_URL}/pelanggan/status-pembayaran`,
        pending: `${FRONTEND_URL}/pelanggan/status-pembayaran`,
      },
    };
    
    console.log('=== MIDTRANS PARAMETER ===', parameter);
    
    // Buat transaksi awal di DB agar order tampil sebelum callback
    try {
      const transaction_details = Array.isArray(items) ? items.map(it => ({
        product_id: it.product_id,
        variant_id: it.variant_id || null,
        quantity: Number(it.quantity) || 1,
        unit_price: Number(it.unit_price || it.price || 0),
        subtotal: Number((it.quantity || 1) * (it.unit_price || it.price || 0))
      })) : [];
      // Ambil shipping cost dari localStorage atau request body
      const shippingCost = req.body.shipping_cost || 0;
      const courier = req.body.courier || null;
      
      console.log('=== SHIPPING DATA DEBUG ===', {
        shipping_cost: req.body.shipping_cost,
        courier: req.body.courier,
        parsed_shipping_cost: shippingCost,
        parsed_courier: courier,
        body: req.body
      });
      
      await transactionModel.createTransaction({
        transaction_code: order_id,
        user_id: req.user?.user_id,
        cashier_id: null,
        total_amount: Number(gross_amount),
        discount: 0,
        final_amount: Number(gross_amount),
        payment_method: payment_type === 'qris' ? 'QRIS' : 'DIGITAL',
        payment_status: 'Pending',
        payment_reference: 'Midtrans',
        transaction_details,
        reduce_stock_now: false,
        shipping_cost: Number(shippingCost),
        courier: courier
      });
    } catch (e) {
      console.error('Create local transaction failed (continuing to Midtrans):', e.message);
    }

    // Initialize Midtrans clients
    const { snap: snapClient } = initializeMidtransClients();
    
    const transaction = await snapClient.createTransaction(parameter);
    console.log('Midtrans transaction created:', {
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      payment_type: payment_type,
      enabled_payments: enabled_payments,
      order_id: order_id,
      gross_amount: gross_amount,
      customer: customer
    });
    res.json({ token: transaction.token, redirect_url: transaction.redirect_url });
  } catch (err) {
    console.error('=== MIDTRANS ERROR ===', {
      message: err.message,
      response: err.response?.data,
      stack: err.stack
    });
    
    if (err.response && err.response.data) {
      console.error('Midtrans API error:', err.response.data);
      res.status(500).json({ 
        message: 'Gagal membuat transaksi Midtrans', 
        error: err.response.data,
        details: err.message 
      });
    } else {
      console.error('Midtrans error:', err.message || err);
      res.status(500).json({ 
        message: 'Gagal membuat transaksi Midtrans', 
        error: err.message 
      });
    }
  }
});

// Endpoint khusus QRIS menggunakan Snap API (karena Core API gagal)
router.post('/qris', auth, async (req, res) => {
  try {
    console.log('=== QRIS REQUEST ===', {
      order_id: req.body.order_id,
      gross_amount: req.body.gross_amount,
      customer: req.body.customer
    });
    
    const { order_id, gross_amount, customer } = req.body;
    
    // Validasi input
    if (!order_id || !gross_amount) {
      return res.status(400).json({ 
        message: 'Data tidak lengkap', 
        required: ['order_id', 'gross_amount'] 
      });
    }
    
    // Gunakan Snap API untuk QRIS (GoPay) karena Core API gagal
    const parameter = {
      transaction_details: {
        order_id,
        gross_amount: Number(gross_amount),
      },
      customer_details: customer || {
        first_name: 'Customer',
        email: 'customer@email.com',
        phone: '08123456789'
      },
      enabled_payments: ['gopay'], // GoPay sudah include QRIS
    };
    
    console.log('=== QRIS SNAP PARAMETER ===', parameter);
    
    // Initialize Midtrans clients
    const { snap: snapClient } = initializeMidtransClients();
    
    const snapResponse = await snapClient.createTransaction(parameter);
    console.log('QRIS Snap API response:', snapResponse);
    
    // Return token untuk frontend kasir gunakan window.snap.pay()
    res.json({ 
      status_code: '200',
      payment_type: 'qris',
      transaction_status: 'pending',
      token: snapResponse.token,
      redirect_url: snapResponse.redirect_url,
      order_id: order_id
    });
  } catch (err) {
    console.error('=== QRIS SNAP ERROR ===', {
      message: err.message,
      response: err.response?.data,
      stack: err.stack
    });
    
    if (err.response && err.response.data) {
      console.error('Midtrans QRIS Snap API error:', err.response.data);
      res.status(500).json({ 
        message: 'Gagal membuat transaksi QRIS', 
        error: err.response.data,
        details: err.message 
      });
    } else {
      console.error('Midtrans QRIS Snap error:', err.message || err);
      res.status(500).json({ 
        message: 'Gagal membuat transaksi QRIS', 
        error: err.message 
      });
    }
  }
});

// Endpoint untuk membuat transaksi BCA Virtual Account (VA)
router.post('/va', auth, async (req, res) => {
  try {
    const { order_id, gross_amount, customer, bank } = req.body;
    const enabledBanks = (process.env.MIDTRANS_ENABLED_BANKS || 'bni,bri,mandiri,permata,cimb')
      .split(',')
      .map(b => b.trim().toLowerCase())
      .filter(Boolean);
    const requestedBank = (bank || '').toLowerCase();
    const finalBank = enabledBanks.includes(requestedBank) ? requestedBank : (enabledBanks[0] || 'bni');
    const parameter = {
      payment_type: 'bank_transfer',
      transaction_details: {
        order_id,
        gross_amount: Number(gross_amount),
      },
      bank_transfer: {
        bank: finalBank,
      },
      customer_details: customer,
    };
    const { core: coreClient } = initializeMidtransClients();
    const chargeResponse = await coreClient.charge(parameter);
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
    const { order_id, transaction_status, fee_amount, payment_type, fraud_status } = req.body;
    
    if (!order_id || !transaction_status) {
      console.error('MIDTRANS CALLBACK ERROR: order_id atau transaction_status tidak ada di body!');
      return res.status(400).json({ message: 'order_id atau transaction_status tidak ada di body!' });
    }
    
    console.log('Processing callback for:', {
      order_id,
      transaction_status,
      payment_type,
      fraud_status,
      fee_amount
    });
    
    // Update transaction status
    await transactionModel.updateMidtransFeeAndStatus(order_id, Number(fee_amount || 0), transaction_status);
    
    // Log success
    console.log('✅ Callback processed successfully for order:', order_id);
    
    res.status(200).json({ message: 'Notifikasi diterima' });
  } catch (err) {
    console.error('==== MIDTRANS CALLBACK ERROR ====', err);
    res.status(500).json({ message: 'Gagal memproses notifikasi Midtrans', error: err.message });
  }
});

module.exports = router; 