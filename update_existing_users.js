const mysql = require('mysql2/promise');

async function updateExistingUsers() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'fashion_park'
    });

    console.log('🔧 Updating existing users to allow login...');
    
    // Check if email_verified column exists
    const [columns] = await connection.execute('DESCRIBE users');
    const hasEmailVerified = columns.some(col => col.Field === 'email_verified');
    
    if (!hasEmailVerified) {
      console.log('❌ email_verified column does not exist. Adding it...');
      
      // Add email_verified column if it doesn't exist
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN email_verified TINYINT(1) DEFAULT 1,
        ADD COLUMN email_verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);
      console.log('✅ Added email_verified columns');
    }

    // Update all existing users to be email verified
    const [result] = await connection.execute(`
      UPDATE users 
      SET email_verified = 1, 
          email_verified_at = CURRENT_TIMESTAMP 
      WHERE email_verified IS NULL OR email_verified = 0
    `);

    console.log(`✅ Updated ${result.affectedRows} users to be email verified`);

    // Show current status
    const [users] = await connection.execute('SELECT userId, name, email, role, email_verified FROM users');
    console.log('\n👥 Current users status:');
    users.forEach(user => {
      console.log(`  ${user.name} (${user.role}): email_verified = ${user.email_verified}`);
    });

    await connection.end();
    console.log('\n🎉 All existing users can now login without email verification!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updateExistingUsers();
