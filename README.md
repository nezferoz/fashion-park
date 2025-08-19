# 🚀 Fashion Park Inventory System

Sistem inventory lengkap untuk bisnis fashion dengan backend Supabase (PostgreSQL) yang sudah dikonversi dari MySQL.

## 📋 Overview

Proyek ini adalah sistem inventory fashion yang komprehensif dengan fitur:
- **User Management** dengan role-based access control
- **Product Management** dengan varian ukuran dan stok
- **Transaction System** dengan berbagai metode pembayaran
- **Inventory Tracking** dengan pergerakan stok
- **Address Management** untuk data alamat Indonesia
- **Row Level Security (RLS)** untuk keamanan data

## 🗂️ Struktur Proyek

```
├── 📁 supabase/                    # Konfigurasi Supabase
│   ├── 📁 migrations/             # File migrasi database
│   ├── 📄 config.toml            # Konfigurasi Supabase CLI
│   ├── 📄 seed.sql               # Data awal
│   └── 📄 package.json           # Dependencies Supabase
├── 📄 supabase-schema.sql        # Skema database utama (PostgreSQL)
├── 📄 mysql-to-supabase-converter.js  # Script konversi MySQL ke Supabase
├── 📄 test-supabase-connection.js     # Test koneksi Supabase
├── 📄 SUPABASE_SETUP.md          # Panduan setup lengkap
├── 📄 env-mysql.template         # Template environment MySQL
└── 📄 README.md                  # File ini
```

## 🎯 Fitur Utama

### 🔐 Authentication & Authorization
- **Row Level Security (RLS)** untuk keamanan data
- **Role-based access control**: admin, kasir, pemilik, pelanggan
- **JWT-based authentication** dengan Supabase Auth

### 📦 Product Management
- **Categories** dengan deskripsi
- **Products** dengan gambar dan deskripsi
- **Product Variants** dengan ukuran, stok, barcode, dan SKU
- **Stock tracking** dengan pergerakan masuk/keluar

### 💳 Transaction System
- **Multiple payment methods**: cash, digital, QRIS
- **Payment status tracking**: pending, success, failed
- **Order status**: menunggu pembayaran, diproses, dikirim, selesai, dibatalkan
- **Refund system** dengan approval workflow

### 🛒 Shopping Features
- **Shopping cart** per user
- **Product search** dan filtering
- **Order history** dan tracking

### 📍 Address Management
- **Complete Indonesian address data**: provinsi, kota, kecamatan, desa
- **Postal code integration**
- **Geolocation support** (latitude/longitude)

## 🚀 Quick Start

### 1. Setup Environment

```bash
# Copy environment template
cp env-mysql.template .env

# Edit .env dengan kredensial Anda
nano .env
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Import Database ke Supabase

#### Opsi A: Import Manual (Recommended)
1. Buka [Supabase Dashboard](https://app.supabase.com)
2. Buat proyek baru
3. Buka SQL Editor
4. Copy dan paste isi `supabase-schema.sql`
5. Klik "Run"

#### Opsi B: Menggunakan Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Login dan link proyek
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# Jalankan migrasi
npm run supabase:db:push
```

### 4. Test Koneksi

```bash
# Test koneksi Supabase
npm run test-supabase
```

### 5. Convert Data dari MySQL (Opsional)

Jika Anda memiliki data MySQL yang ingin dikonversi:

```bash
# Setup environment MySQL
cp env-mysql.template .env
# Edit .env dengan kredensial MySQL

# Jalankan konversi
npm run convert-mysql
```

## 🔧 Konfigurasi

### Environment Variables

```bash
# MySQL (untuk konversi data)
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=fashion_park

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Supabase Client Setup

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## 🏗️ Database Schema

### Tabel Utama
- **users** - Data pengguna dengan role dan alamat
- **categories** - Kategori produk
- **products** - Produk utama
- **product_variants** - Varian produk (ukuran, stok)
- **transactions** - Transaksi penjualan
- **transaction_details** - Detail item transaksi
- **cart** - Keranjang belanja
- **stock_movements** - Tracking pergerakan stok
- **refunds** - Pengembalian dana
- **notifications** - Notifikasi pengguna

### Tabel Alamat
- **provinces** - Provinsi Indonesia
- **cities** - Kota/Kabupaten
- **districts** - Kecamatan
- **villages** - Desa/Kelurahan
- **postal_codes** - Kode pos

## 🔐 Security Features

### Row Level Security (RLS)
- **Users**: Hanya bisa akses data sendiri
- **Products**: Public read, admin write
- **Transactions**: User lihat transaksi sendiri, kasir lihat semua
- **Cart**: User hanya akses keranjang sendiri
- **Stock**: Hanya admin yang bisa akses

### Policies
Semua tabel memiliki RLS policies yang menggunakan `auth.uid()` untuk identifikasi user dan role-based access control.

## 📊 Data Sample

Sistem sudah dilengkapi dengan data sample:
- **4 kategori** produk (Pakaian Pria, Pakaian Wanita, Aksesoris, Sepatu)
- **3 produk** dengan varian ukuran
- **5 provinsi** dan **18 kota** di Indonesia
- **Data alamat lengkap** untuk Kota Padang

## 🧪 Testing

### Test Koneksi
```bash
npm run test-supabase
```

### Test Query
```sql
-- Cek tabel yang sudah terbuat
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Cek data sample
SELECT * FROM categories;
SELECT * FROM products;
SELECT * FROM product_variants;
```

## 🚨 Troubleshooting

### Error Umum
1. **"relation does not exist"**
   - Pastikan file SQL sudah dijalankan dengan benar
   - Cek urutan eksekusi (tabel harus dibuat sebelum foreign key)

2. **"permission denied"**
   - Cek RLS policies sudah aktif
   - Pastikan user sudah login dan memiliki role yang sesuai

3. **"duplicate key value"**
   - Gunakan `ON CONFLICT DO NOTHING` untuk data sample
   - Atau hapus data lama terlebih dahulu

### Reset Database
```bash
# Jika menggunakan CLI
npm run supabase:db:reset

# Jika manual, hapus semua tabel dan jalankan ulang
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
-- Jalankan ulang supabase-schema.sql
```

## 📚 Documentation

- **📖 [SUPABASE_SETUP.md](SUPABASE_SETUP.md)** - Panduan setup lengkap
- **🔗 [Supabase Documentation](https://supabase.com/docs)** - Dokumentasi resmi
- **📋 [PostgreSQL Documentation](https://www.postgresql.org/docs/)** - Referensi database

## 🤝 Contributing

1. Fork proyek ini
2. Buat branch fitur baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 License

Proyek ini dilisensikan di bawah MIT License - lihat file [LICENSE](LICENSE) untuk detail.

## 📞 Support

Jika mengalami masalah:
1. Cek error message di Supabase Dashboard
2. Verifikasi struktur tabel di Table Editor
3. Test query sederhana untuk memastikan koneksi
4. Cek RLS policies di Authentication menu
5. Buat issue di repository ini

## 🎉 Selamat!

Database Fashion Park Inventory System sudah siap digunakan di Supabase! 

**Langkah selanjutnya:**
1. Test aplikasi frontend dengan database baru
2. Sesuaikan kode aplikasi dengan struktur tabel baru
3. Test fitur authentication dan authorization
4. Deploy ke production

---

**Catatan:** Semua file sudah dioptimasi untuk Supabase dan PostgreSQL. Tidak perlu konversi manual lagi. 