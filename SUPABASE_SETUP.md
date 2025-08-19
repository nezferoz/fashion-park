# 🚀 Supabase Setup Guide - Fashion Park Inventory System

## 📋 Overview

Dokumen ini berisi panduan lengkap untuk mengimpor database Fashion Park Inventory System ke Supabase. Sistem ini sudah dikonversi dari MySQL ke PostgreSQL dan siap digunakan.

## 🗂️ File yang Tersedia

### 1. **supabase-schema.sql** (File Utama)
- Skema database lengkap untuk Supabase
- Sudah dikonversi dari MySQL ke PostgreSQL
- Berisi semua tabel, index, trigger, dan function
- **Gunakan file ini jika ingin import manual melalui SQL Editor**

### 2. **supabase/migrations/** (Migrasi Terstruktur)
- `20250101000000_initial_schema.sql` - Skema dasar
- `20250101000001_sample_data_and_rls.sql` - Data sample dan RLS policies
- **Gunakan ini jika menggunakan Supabase CLI**

### 3. **supabase/seed.sql** (Data Awal)
- Data sample untuk testing
- Kategori, produk, dan data alamat Indonesia

### 4. **supabase/config.toml** (Konfigurasi)
- Konfigurasi untuk Supabase CLI

## 🎯 Cara Import ke Supabase

### Opsi 1: Import Manual (Recommended untuk Database Besar)

1. **Buka Supabase Dashboard**
   - Login ke [app.supabase.com](https://app.supabase.com)
   - Pilih proyek Anda

2. **Buka SQL Editor**
   - Klik menu "SQL Editor" di sidebar kiri
   - Buat "New Query"

3. **Copy dan Paste File `supabase-schema.sql`**
   - Copy seluruh isi file `supabase-schema.sql`
   - Paste ke SQL Editor
   - Klik "Run" untuk menjalankan

4. **Verifikasi Import**
   - Cek menu "Table Editor" untuk memastikan tabel sudah terbuat
   - Cek menu "Authentication" untuk memastikan RLS sudah aktif

### Opsi 2: Menggunakan Supabase CLI

1. **Install Supabase CLI**
   ```bash
   # Windows dengan Chocolatey
   choco install supabase
   
   # Windows dengan Scoop
   scoop install supabase
   
   # Atau download manual dari GitHub
   ```

2. **Login dan Link Proyek**
   ```bash
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   ```

3. **Jalankan Migrasi**
   ```bash
   supabase db push
   ```

4. **Seed Data (Opsional)**
   ```bash
   supabase db reset
   ```

## 🏗️ Struktur Database

### Tabel Utama
- **users** - Data pengguna (admin, kasir, pemilik, pelanggan)
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

## 🔐 Fitur Keamanan

### Row Level Security (RLS)
- **Users**: Hanya bisa akses data sendiri
- **Products**: Public read, admin write
- **Transactions**: User bisa lihat transaksi sendiri, kasir bisa lihat semua
- **Cart**: User hanya bisa akses keranjang sendiri
- **Stock**: Hanya admin yang bisa akses

### Policies
- Semua tabel sudah memiliki RLS policies yang sesuai
- Policies menggunakan `auth.uid()` untuk identifikasi user
- Role-based access control (admin, kasir, pemilik, pelanggan)

## 🚀 Fitur Database

### Triggers
- Auto-update `updated_at` timestamp
- Auto-generate SKU untuk product variants

### Functions
- `generate_product_sku()` - Generate SKU otomatis
- `update_updated_at_column()` - Update timestamp

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
- 10 kecamatan di Kota Padang
- 13 kelurahan di Kecamatan Kuranji
- Kode pos lengkap

## 🔧 Konfigurasi Tambahan

### Environment Variables
```bash
# Tambahkan ke .env file aplikasi
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Supabase Client Setup
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## 🧪 Testing

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

-- Cek RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
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
supabase db reset

# Jika manual, hapus semua tabel dan jalankan ulang
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
-- Jalankan ulang supabase-schema.sql
```

## 📞 Support

Jika mengalami masalah:
1. Cek error message di Supabase Dashboard
2. Verifikasi struktur tabel di Table Editor
3. Test query sederhana untuk memastikan koneksi
4. Cek RLS policies di Authentication menu

## 🎉 Selamat!

Database Fashion Park Inventory System sudah siap digunakan di Supabase! 

**Langkah selanjutnya:**
1. Test aplikasi frontend dengan database baru
2. Sesuaikan kode aplikasi dengan struktur tabel baru
3. Test fitur authentication dan authorization
4. Deploy ke production

---

**Catatan:** Semua file sudah dioptimasi untuk Supabase dan PostgreSQL. Tidak perlu konversi manual lagi.
