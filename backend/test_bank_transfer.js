require('dotenv').config({ path: './config.env' });
const midtransClient = require('midtrans-client');

async function testBankTransfer() {
  console.log('🏦 Testing Bank Transfer/VA Configuration...\n');

  try {
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const clientKey = process.env.MIDTRANS_CLIENT_KEY;
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
    
    console.log('🔑 Midtrans Configuration:');
    console.log('  Server Key:', serverKey.substring(0, 10) + '...');
    console.log('  Client Key:', clientKey.substring(0, 10) + '...');
    console.log('  Production:', isProduction);
    console.log('  Enabled Banks:', process.env.MIDTRANS_ENABLED_BANKS);
    console.log('');

    const core = new midtransClient.CoreApi({
      isProduction: isProduction,
      serverKey: serverKey,
      clientKey: clientKey,
    });
    
    console.log('✅ Midtrans Core API client initialized successfully!\n');
    
    // Test BNI Virtual Account
    console.log('🧪 Testing BNI Virtual Account...');
    const testPayload = {
      payment_type: 'bank_transfer',
      transaction_details: {
        order_id: 'TEST-VA-' + Date.now(),
        gross_amount: 50000,
      },
      bank_transfer: {
        bank: 'bni',
      },
      customer_details: {
        first_name: 'Test Customer',
        email: 'test@example.com',
        phone: '08123456789'
      },
    };
    
    console.log('📤 Test Payload:', JSON.stringify(testPayload, null, 2));
    
    const response = await core.charge(testPayload);
    console.log('✅ Bank Transfer Test Successful!');
    console.log('📱 Response:', JSON.stringify(response, null, 2));
    
    // Extract VA number
    if (response.va_numbers && response.va_numbers.length > 0) {
      const vaNumber = response.va_numbers[0];
      console.log('\n💳 Virtual Account Details:');
      console.log(`  Bank: ${vaNumber.bank}`);
      console.log(`  VA Number: ${vaNumber.va_number}`);
      console.log(`  Order ID: ${response.order_id}`);
      console.log(`  Amount: Rp ${response.gross_amount.toLocaleString('id-ID')}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.response && error.response.data) {
      console.error('📡 API Response:', error.response.data);
    }
    
    console.log('\n💡 Troubleshooting Tips:');
    console.log('  1. Check if bank transfer channel is activated');
    console.log('  2. Verify if BNI bank is enabled in Midtrans dashboard');
    console.log('  3. Ensure account has sufficient balance for testing');
  }
}

testBankTransfer();
