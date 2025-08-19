require('dotenv').config({ path: './config.env' });
const midtransClient = require('midtrans-client');

async function testSnapAPI() {
  console.log('🎯 Testing Midtrans Snap API...\n');

  try {
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const clientKey = process.env.MIDTRANS_CLIENT_KEY;
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
    
    console.log('🔑 Midtrans Configuration:');
    console.log('  Server Key:', serverKey.substring(0, 10) + '...');
    console.log('  Client Key:', clientKey.substring(0, 10) + '...');
    console.log('  Production:', isProduction);
    console.log('');

    const snap = new midtransClient.Snap({
      isProduction: isProduction,
      serverKey: serverKey,
      clientKey: clientKey,
    });
    
    console.log('✅ Midtrans Snap client initialized successfully!\n');
    
    // Test with minimal enabled payments
    console.log('🧪 Testing Snap API with minimal payment methods...');
    const testPayload = {
      transaction_details: {
        order_id: 'TEST-SNAP-' + Date.now(),
        gross_amount: 10000,
      },
      customer_details: {
        first_name: 'Test Customer',
        email: 'test@example.com',
        phone: '08123456789'
      },
      // Hanya aktifkan payment methods yang sudah pasti aktif
      enabled_payments: ['gopay'],
      callbacks: {
        finish: 'https://example.com/finish',
        error: 'https://example.com/error',
        pending: 'https://example.com/pending',
      },
    };
    
    console.log('📤 Test Payload:', JSON.stringify(testPayload, null, 2));
    
    const response = await snap.createTransaction(testPayload);
    console.log('✅ Snap API Test Successful!');
    console.log('📱 Response:', JSON.stringify(response, null, 2));
    
    if (response.token) {
      console.log('\n🎫 Snap Token:', response.token);
      console.log('🔗 Redirect URL:', response.redirect_url);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.response && error.response.data) {
      console.error('📡 API Response:', error.response.data);
    }
    
    console.log('\n💡 Troubleshooting Tips:');
    console.log('  1. Check if any payment method is activated');
    console.log('  2. Verify account status in Midtrans dashboard');
    console.log('  3. Try with different enabled_payments combinations');
  }
}

testSnapAPI();
