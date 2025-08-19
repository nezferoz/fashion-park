const mysql = require('mysql2/promise');

async function updateTransactionStatus() {
  try {
    console.log('🔧 Updating Transaction Status...\n');
    
    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'fashion_park'
    });
    
    console.log('✅ Database connected successfully\n');
    
    // Get transactions that are marked as "selesai" but still PENDING
    const [transactions] = await connection.execute(`
      SELECT * FROM transactions 
      WHERE status = 'PENDING' 
      AND (notes LIKE '%selesai%' OR notes IS NOT NULL)
    `);
    
    console.log('📊 Found transactions to update:', transactions.length);
    
    if (transactions.length > 0) {
      console.log('\n📋 Transactions to update:');
      transactions.forEach((t, i) => {
        console.log(`${i+1}. ID: ${t.transaction_id}, Amount: ${t.final_amount}, Notes: ${t.notes || 'N/A'}`);
      });
      
      // Update status to SUCCESS
      for (const transaction of transactions) {
        await connection.execute(`
          UPDATE transactions 
          SET status = 'SUCCESS', 
              updated_at = NOW() 
          WHERE transaction_id = ?
        `, [transaction.transaction_id]);
        
        console.log(`✅ Updated transaction ${transaction.transaction_id} to SUCCESS`);
      }
      
      console.log('\n🎉 All transactions updated successfully!');
      
      // Verify the update
      const [updatedTransactions] = await connection.execute(`
        SELECT transaction_id, status, final_amount, notes 
        FROM transactions 
        WHERE transaction_id IN (${transactions.map(t => t.transaction_id).join(',')})
      `);
      
      console.log('\n📊 Verification - Updated transactions:');
      updatedTransactions.forEach(t => {
        console.log(`ID: ${t.transaction_id}, Status: ${t.status}, Amount: ${t.final_amount}`);
      });
      
    } else {
      console.log('ℹ️ No transactions found that need updating');
    }
    
    // Show current status breakdown
    const [statusCounts] = await connection.execute(`
      SELECT status, COUNT(*) as count, SUM(final_amount) as total_amount
      FROM transactions 
      GROUP BY status
    `);
    
    console.log('\n📈 Current Transaction Status Breakdown:');
    statusCounts.forEach(row => {
      console.log(`${row.status}: ${row.count} transactions, Total: Rp${row.total_amount || 0}`);
    });
    
    await connection.end();
    console.log('\n✅ Update completed successfully');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updateTransactionStatus();
