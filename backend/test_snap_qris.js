require('dotenv').config({ path: './config.env' });
const midtransClient = require('midtrans-client');

async function testSnapQris() {
  console.log('🧪 Testing Snap API with QRIS enabled_payments...\n');
  const snap = new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
  });
  const payload = {
    transaction_details: {
      order_id: 'TEST-SNAP-QRIS-' + Date.now(),
      gross_amount: 10000,
    },
    enabled_payments: ['qris'],
    customer_details: { first_name: 'Test', email: 'test@example.com' },
  };
  try {
    const resp = await snap.createTransaction(payload);
    console.log('✅ Snap QRIS OK:', resp);
  } catch (err) {
    console.error('❌ Snap QRIS Error:', err.message);
    if (err.response && err.response.data) console.error('API:', err.response.data);
  }
}

testSnapQris();
