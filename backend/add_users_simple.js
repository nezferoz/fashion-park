const db = require('./src/config/db');

async function addUsers() {
  try {
    console.log('Menambahkan user baru...');
    
    // Data user yang akan ditambahkan
    const users = [
      {
        name: 'Admin2',
        email: 'admin2@example.com',
        password: 'admin821',
        phone: '081234567890',
        address: 'Jl. Admin No. 2, Jakarta',
        role: 'admin'
      },
      {
        name: 'Owner2',
        email: 'owner2@example.com',
        password: 'admin821',
        phone: '081234567891',
        address: 'Jl. Owner No. 2, Jakarta',
        role: 'pemilik'
      },
      {
        name: 'Kasir2',
        email: 'kasir2@example.com',
        password: 'admin821',
        phone: '081234567892',
        address: 'Jl. Kasir No. 2, Jakarta',
        role: 'kasir'
      }
    ];

    // Tambahkan setiap user
    for (const user of users) {
      // Cek apakah email sudah ada
      const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [user.email]);
      
      if (existing.length > 0) {
        console.log(`User dengan email ${user.email} sudah ada, melewati...`);
        continue;
      }

      // Insert user baru
      const [result] = await db.query(
        'INSERT INTO users (name, email, password, phone, address, role) VALUES (?, ?, ?, ?, ?, ?)',
        [user.name, user.email, user.password, user.phone, user.address, user.role]
      );

      console.log(`User ${user.name} (${user.role}) berhasil ditambahkan dengan ID: ${result.insertId}`);
    }

    console.log('Selesai menambahkan user!');
    console.log('\nInformasi Login:');
    console.log('Email: admin2@example.com, Password: admin821 (Role: Admin)');
    console.log('Email: owner2@example.com, Password: admin821 (Role: Owner/Pemilik)');
    console.log('Email: kasir2@example.com, Password: admin821 (Role: Kasir)');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Tutup koneksi database
    await db.end();
  }
}

// Jalankan script
addUsers(); 