const mysql = require('mysql2/promise');

async function checkUsersStructure() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'fashion_park'
    });

    console.log('🔍 Checking users table structure...');
    
    // Check table structure
    const [columns] = await connection.execute('DESCRIBE users');
    console.log('\n📋 Users table structure:');
    columns.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });

    // Check if email_verified column exists
    const hasEmailVerified = columns.some(col => col.Field === 'email_verified');
    console.log(`\n✅ email_verified column exists: ${hasEmailVerified}`);

    if (hasEmailVerified) {
      // Check email_verified values for existing users
      const [users] = await connection.execute('SELECT userId, name, email, role, email_verified FROM users');
      console.log('\n👥 Current users email_verified status:');
      users.forEach(user => {
        console.log(`  ${user.name} (${user.role}): email_verified = ${user.email_verified}`);
      });
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkUsersStructure();
