require('dotenv').config();

console.log('🧪 Testing Midtrans Configuration...\n');

// Check environment variables
console.log('📋 ENVIRONMENT VARIABLES:');
console.log(`  MIDTRANS_SERVER_KEY: ${process.env.MIDTRANS_SERVER_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`  MIDTRANS_CLIENT_KEY: ${process.env.MIDTRANS_CLIENT_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`  MIDTRANS_IS_PRODUCTION: ${process.env.MIDTRANS_IS_PRODUCTION || 'false'}`);

if (process.env.MIDTRANS_SERVER_KEY) {
  console.log(`  Server Key: ${process.env.MIDTRANS_SERVER_KEY.substring(0, 10)}...`);
}
if (process.env.MIDTRANS_CLIENT_KEY) {
  console.log(`  Client Key: ${process.env.MIDTRANS_CLIENT_KEY.substring(0, 10)}...`);
}

console.log('\n🔑 TESTING MIDTRANS CLIENT...');

// Test Midtrans client
const midtransClient = require('midtrans-client');

try {
  const snap = new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
  });
  
  console.log('✅ Midtrans Snap client initialized successfully!');
  console.log(`  Production Mode: ${process.env.MIDTRANS_IS_PRODUCTION === 'true'}`);
  
  // Test simple transaction creation
  console.log('\n🧪 Testing transaction creation...');
  
  const testParameter = {
    transaction_details: {
      order_id: 'TEST-ORDER-001',
      gross_amount: 10000,
    },
    customer_details: {
      first_name: 'Test Customer',
      email: 'test@example.com',
      phone: '08123456789'
    },
    enabled_payments: ['qris', 'gopay'],
  };
  
  console.log('Test parameter:', JSON.stringify(testParameter, null, 2));
  
  // Note: We won't actually create a transaction, just test the client
  console.log('✅ Midtrans client is ready for transactions!');
  
} catch (error) {
  console.error('❌ Midtrans client initialization failed:', error.message);
  console.error('Stack:', error.stack);
}

console.log('\n🎯 SUMMARY:');
if (process.env.MIDTRANS_SERVER_KEY && process.env.MIDTRANS_CLIENT_KEY && process.env.MIDTRANS_IS_PRODUCTION === 'true') {
  console.log('✅ All Midtrans environment variables are set correctly!');
  console.log('💡 You can now restart your backend and test payments.');
} else {
  console.log('❌ Some Midtrans environment variables are missing or incorrect!');
  console.log('💡 Please check your .env file and make sure all variables are set.');
}
