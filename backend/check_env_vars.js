require('dotenv').config();

console.log('🔍 Checking Environment Variables...\n');

// RajaOngkir
console.log('📦 RAJAONGKIR:');
console.log(`  RAJAONGKIR_API_KEY: ${process.env.RAJAONGKIR_API_KEY ? '✅ Set' : '❌ Missing'}`);
if (process.env.RAJAONGKIR_API_KEY) {
  console.log(`  Value: ${process.env.RAJAONGKIR_API_KEY.substring(0, 10)}...`);
}

console.log('\n💳 MIDTRANS:');
console.log(`  MIDTRANS_SERVER_KEY: ${process.env.MIDTRANS_SERVER_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`  MIDTRANS_CLIENT_KEY: ${process.env.MIDTRANS_CLIENT_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`  MIDTRANS_IS_PRODUCTION: ${process.env.MIDTRANS_IS_PRODUCTION || 'false'}`);

if (process.env.MIDTRANS_SERVER_KEY) {
  console.log(`  Server Key: ${process.env.MIDTRANS_SERVER_KEY.substring(0, 10)}...`);
}
if (process.env.MIDTRANS_CLIENT_KEY) {
  console.log(`  Client Key: ${process.env.MIDTRANS_CLIENT_KEY.substring(0, 10)}...`);
}

console.log('\n🌐 OTHER:');
console.log(`  FRONTEND_URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
console.log(`  BACKEND_URL: ${process.env.BACKEND_URL || 'http://localhost:5000'}`);

console.log('\n📋 SUMMARY:');
const rajaongkir = process.env.RAJAONGKIR_API_KEY ? '✅' : '❌';
const midtransServer = process.env.MIDTRANS_SERVER_KEY ? '✅' : '❌';
const midtransClient = process.env.MIDTRANS_CLIENT_KEY ? '✅' : '❌';

console.log(`  RajaOngkir: ${rajaongkir}`);
console.log(`  Midtrans Server: ${midtransServer}`);
console.log(`  Midtrans Client: ${midtransClient}`);

if (rajaongkir === '✅' && midtransServer === '✅' && midtransClient === '✅') {
  console.log('\n🎉 All required API keys are set!');
  console.log('💡 Try restarting the backend now.');
} else {
  console.log('\n⚠️  Some API keys are missing!');
  console.log('💡 Check your .env file and make sure all keys are set.');
}
