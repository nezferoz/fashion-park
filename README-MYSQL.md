# 🚀 Fashion Park Inventory System - MySQL Setup

## 📋 Overview

Sistem Fashion Park Inventory yang kompatibel dengan MySQL database. Sistem ini menggunakan struktur database yang sama dengan yang sudah ada, tanpa perubahan yang tidak diperlukan.

## 🗂️ File yang Tersedia

### 1. **`mysql-config.sql`** (Konfigurasi Database)
- Setup karakter set dan collation
- Konfigurasi SQL mode
- Timezone dan foreign key settings

### 2. **`mysql-compatible-schema.sql`** (Schema Database)
- Struktur tabel lengkap untuk MySQL
- Triggers untuk auto-generate SKU
- Sample data untuk testing
- Indexes untuk performa optimal

## 🎯 Cara Setup Database

### Langkah 1: Konfigurasi Database
```bash
# Login ke MySQL
mysql -u root -p

# Jalankan file konfigurasi
source mysql-config.sql
```

### Langkah 2: Import Schema
```bash
# Jalankan file schema
source mysql-compatible-schema.sql
```

### Langkah 3: Verifikasi
```sql
-- Cek tabel yang sudah terbuat
SHOW TABLES;

-- Cek data sample
SELECT * FROM categories;
SELECT * FROM products;
SELECT * FROM product_variants;
```

## 🏗️ Struktur Database

### Tabel Utama
- **users** - Data pengguna (admin, kasir, pemilik, pelanggan)
- **categories** - Kategori produk
- **products** - Produk utama dengan stok quantity
- **product_variants** - Varian produk (ukuran, stok per ukuran)
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

## 🔧 Fitur Database

### Triggers
- Auto-update `updated_at` timestamp
- Auto-generate SKU untuk product variants

### Functions
- `generate_product_sku()` - Generate SKU otomatis

### Indexes
- Index untuk email, role, category, SKU, barcode
- Index untuk performa query yang optimal

## 📊 Data Sample

### Kategori
- Pakaian Pria
- Pakaian Wanita
- Aksesoris
- Sepatu

### Produk
- Kaos Polos Premium (Rp 150.000)
- Celana Jeans Slim Fit (Rp 250.000)
- Dress Casual (Rp 300.000)

### Varian
- Ukuran: S, M, L, XL
- Stok per ukuran
- Barcode dan SKU unik

### Data Alamat
- 5 provinsi (Sumatera Barat, Jawa Barat, Jawa Tengah, Bali, Kalimantan Barat)
- 18 kota di Sumatera Barat

## 🔐 Keamanan

### User Roles
- **admin** - Akses penuh ke semua fitur
- **kasir** - Akses transaksi dan produk
- **pemilik** - Akses laporan dan keuangan
- **pelanggan** - Akses produk dan keranjang

### Data Validation
- ENUM constraints untuk role dan status
- Foreign key constraints untuk integritas data
- Check constraints untuk validasi data

## 🚀 Langkah Selanjutnya

1. **Setup Database** menggunakan file yang tersedia
2. **Test Koneksi** dengan aplikasi frontend
3. **Verifikasi Data** sample sudah masuk dengan benar
4. **Test Fitur** CRUD operations
5. **Deploy** ke production

## 🧪 Testing

### Test Query
```sql
-- Cek struktur tabel
DESCRIBE users;
DESCRIBE products;
DESCRIBE transactions;

-- Cek data sample
SELECT * FROM categories;
SELECT * FROM products LIMIT 5;
SELECT * FROM product_variants LIMIT 5;

-- Cek foreign keys
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE REFERENCED_TABLE_SCHEMA = 'fashion_park';
```

## 🚨 Troubleshooting

### Error Umum
1. **"Access denied"**
   - Pastikan user MySQL memiliki privilege yang cukup
   - Cek password dan username

2. **"Table already exists"**
   - Gunakan `DROP TABLE IF EXISTS` jika perlu
   - Atau gunakan `CREATE TABLE IF NOT EXISTS`

3. **"Foreign key constraint fails"**
   - Pastikan tabel parent sudah dibuat
   - Cek urutan eksekusi SQL

### Reset Database
```sql
-- Hapus semua tabel (HATI-HATI!)
SET FOREIGN_KEY_CHECKS = 0;
DROP DATABASE fashion_park;
CREATE DATABASE fashion_park;
SET FOREIGN_KEY_CHECKS = 1;

-- Jalankan ulang setup
source mysql-config.sql
source mysql-compatible-schema.sql
```

## 📞 Support

Jika mengalami masalah:
1. Cek error message MySQL
2. Verifikasi struktur tabel dengan `DESCRIBE`
3. Test query sederhana untuk memastikan koneksi
4. Cek foreign key constraints

## 🎉 Selamat!

Database Fashion Park Inventory sudah siap digunakan dengan MySQL! 

**Langkah selanjutnya:**
1. Setup database menggunakan file yang tersedia
2. Test dengan aplikasi frontend
3. Sesuaikan aplikasi dengan struktur tabel ini
4. Deploy ke production

---

**Catatan:** Sistem ini menggunakan struktur database MySQL yang kompatibel dengan yang sudah ada, tanpa perubahan yang tidak diperlukan.
