const mysql = require('mysql2/promise');

async function testKPIChanges() {
  try {
    console.log('🔍 Testing KPI Changes (SUCCESS transactions only)...\n');
    
    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'fashion_park'
    });
    
    console.log('✅ Database connected successfully\n');
    
    // Get all transactions
    const [transactions] = await connection.execute('SELECT * FROM transactions');
    const [users] = await connection.execute('SELECT * FROM users');
    const [products] = await connection.execute('SELECT * FROM products');
    
    console.log('📊 Raw Data Counts:');
    console.log('Total Transactions:', transactions.length);
    console.log('Users:', users.length);
    console.log('Products:', products.length);
    
    // Filter by status
    const successTransactions = transactions.filter(t => t.status === 'SUCCESS');
    const pendingTransactions = transactions.filter(t => t.status === 'PENDING');
    const failedTransactions = transactions.filter(t => t.status === 'FAILED');
    
    console.log('\n📈 Transaction Status Breakdown:');
    console.log('SUCCESS:', successTransactions.length);
    console.log('PENDING:', pendingTransactions.length);
    console.log('FAILED:', failedTransactions.length);
    
    // Calculate revenue by status
    const totalRevenue = transactions.reduce((sum, t) => sum + Number(t.final_amount || 0), 0);
    const successRevenue = successTransactions.reduce((sum, t) => sum + Number(t.final_amount || 0), 0);
    const pendingRevenue = pendingTransactions.reduce((sum, t) => sum + Number(t.final_amount || 0), 0);
    
    console.log('\n💰 Revenue by Status:');
    console.log('Total Revenue (All):', totalRevenue);
    console.log('Success Revenue:', successRevenue);
    console.log('Pending Revenue:', pendingRevenue);
    console.log('Difference (Pending):', totalRevenue - successRevenue);
    
    // Calculate current month data
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const currentMonthTransactions = transactions.filter(t => {
      if (!t.transaction_date) return false;
      const transactionDate = new Date(t.transaction_date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });
    
    const currentMonthSuccessTransactions = currentMonthTransactions.filter(t => t.status === 'SUCCESS');
    const currentMonthSuccessRevenue = currentMonthSuccessTransactions.reduce((sum, t) => sum + Number(t.final_amount || 0), 0);
    
    console.log('\n📅 Current Month Analysis:');
    console.log('Current Month Total Transactions:', currentMonthTransactions.length);
    console.log('Current Month Success Transactions:', currentMonthSuccessTransactions.length);
    console.log('Current Month Success Revenue:', currentMonthSuccessRevenue);
    
    await connection.end();
    console.log('\n✅ Test completed successfully');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testKPIChanges();
