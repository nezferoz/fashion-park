const mysql = require('mysql2');

console.log('🔍 Testing Database Connection...');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', 
  database: 'fashion_park'
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    
    if (err.code === 'ECONNREFUSED') {
      console.log('💡 Solution: Start MySQL/XAMPP service');
      console.log('   - Buka XAMPP Control Panel');
      console.log('   - Start MySQL service');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 Solution: Check username/password');
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      console.log('💡 Solution: Database "fashion_park" does not exist');
    }
    return;
  }
  
  console.log('✅ Database connected successfully!');
  
  // Test simple query
  connection.query('SELECT COUNT(*) as count FROM products', (err, results) => {
    if (err) {
      console.error('❌ Query failed:', err.message);
    } else {
      console.log('✅ Products table accessible:', results[0]);
    }
    
    connection.end();
  });
});
