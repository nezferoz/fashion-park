require('dotenv').config({ path: './config.env' });
const midtransClient = require('midtrans-client');

async function testMidtransConfig() {
  console.log('🔍 Testing Midtrans Configuration...\n');

  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('  MIDTRANS_SERVER_KEY:', process.env.MIDTRANS_SERVER_KEY ? '✅ Set' : '❌ Missing');
  console.log('  MIDTRANS_CLIENT_KEY:', process.env.MIDTRANS_CLIENT_KEY ? '✅ Set' : '❌ Missing');
  console.log('  MIDTRANS_IS_PRODUCTION:', process.env.MIDTRANS_IS_PRODUCTION);
  console.log('  BACKEND_URL:', process.env.BACKEND_URL);
  console.log('  NODE_ENV:', process.env.NODE_ENV);
  console.log('');

  // Test Midtrans client initialization
  try {
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const clientKey = process.env.MIDTRANS_CLIENT_KEY;
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
    
    if (!serverKey || !clientKey) {
      throw new Error('Midtrans API keys not found!');
    }
    
    console.log('🔑 Initializing Midtrans clients...');
    console.log('  Server Key:', serverKey.substring(0, 10) + '...');
    console.log('  Client Key:', clientKey.substring(0, 10) + '...');
    console.log('  Production:', isProduction);
    
    const core = new midtransClient.CoreApi({
      isProduction: isProduction,
      serverKey: serverKey,
      clientKey: clientKey,
    });
    
    console.log('✅ Midtrans Core API client initialized successfully!\n');
    
    // Test QRIS payment
    console.log('🧪 Testing QRIS Payment...');
    const testPayload = {
      payment_type: 'qris',
      transaction_details: {
        order_id: 'TEST-' + Date.now(),
        gross_amount: 1000,
      },
      customer_details: {
        first_name: 'Test Customer',
        email: 'test@example.com',
        phone: '08123456789'
      },
    };
    
    console.log('📤 Test Payload:', JSON.stringify(testPayload, null, 2));
    
    const response = await core.charge(testPayload);
    console.log('✅ QRIS Test Successful!');
    console.log('📱 Response:', JSON.stringify(response, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.response && error.response.data) {
      console.error('📡 API Response:', error.response.data);
    }
    
    console.log('\n💡 Troubleshooting Tips:');
    console.log('  1. Check if Midtrans API keys are correct');
    console.log('  2. Verify if QRIS channel is activated in Midtrans dashboard');
    console.log('  3. Ensure account is not in sandbox mode if using production keys');
    console.log('  4. Check Midtrans account status and limits');
  }
}

testMidtransConfig();
