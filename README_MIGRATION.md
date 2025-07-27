# Panduan Migrasi Database: Barcode per Ukuran

## 📋 Overview
Script ini akan mengubah struktur database Anda agar setiap ukuran produk memiliki barcode yang unik.

## 🚀 Langkah-langkah Implementasi

### 1. Backup Database (WAJIB!)
```sql
-- Backup tabel products
CREATE TABLE products_backup AS SELECT * FROM products;

-- Backup tabel product_variants  
CREATE TABLE product_variants_backup AS SELECT * FROM product_variants;
```

### 2. Jalankan Script Migrasi
1. Buka phpMyAdmin atau MySQL client
2. Jalankan script `database_migration.sql`
3. Jalankan script `additional_migration.sql`

### 3. Verifikasi Hasil
```sql
-- Cek struktur tabel baru
DESCRIBE product_variants;

-- Cek data yang sudah dimigrasi
SELECT 
    p.product_name,
    pv.size,
    pv.barcode,
    pv.sku,
    pv.stock_quantity
FROM products p
JOIN product_variants pv ON p.product_id = pv.product_id
LIMIT 10;
```

## 📊 Struktur Database Baru

### Tabel `products`
```sql
product_id (INT, AUTO_INCREMENT, PRIMARY KEY)
product_name (VARCHAR)
description (TEXT)
price (DECIMAL) -- Harga dasar
category_id (INT)
is_active (TINYINT)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
image (LONGBLOB)
```

### Tabel `product_variants`
```sql
variant_id (INT, AUTO_INCREMENT, PRIMARY KEY)
product_id (INT, FOREIGN KEY)
size (VARCHAR) -- S, M, L, XL, dll
barcode (VARCHAR, UNIQUE) -- BARCODE UNIK PER UKURAN
sku (VARCHAR, UNIQUE) -- SKU per variant
stock_quantity (INT) -- Stok per ukuran
price_adjustment (DECIMAL) -- Penyesuaian harga
is_active (TINYINT)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

## 🏷️ Format Barcode & SKU

### Barcode Format
- **Pattern:** `PROD{product_id}VAR{variant_id}`
- **Contoh:** `PROD000001VAR0001`
- **Panjang:** 20 karakter
- **Unik:** Ya, karena kombinasi product_id + variant_id

### SKU Format  
- **Pattern:** `SKU{product_id}-{SIZE}-{variant_id}`
- **Contoh:** `SKU000001-S-0001`
- **Panjang:** Variabel
- **Unik:** Ya, mudah dibaca

## 🔧 Fitur Otomatis

### 1. Auto-Generate Barcode
```sql
-- Trigger otomatis generate barcode saat insert
INSERT INTO product_variants (product_id, size, stock_quantity) 
VALUES (1, 'M', 15);
-- Barcode akan otomatis: PROD000001VAR0002
```

### 2. Auto-Generate SKU
```sql
-- SKU akan otomatis: SKU000001-M-0002
```

### 3. View untuk Query Mudah
```sql
-- Gunakan view untuk query yang lebih mudah
SELECT * FROM product_with_variants WHERE barcode = 'PROD000001VAR0001';
```

## 📝 Query Penting

### Cari Produk berdasarkan Barcode
```sql
SELECT 
    p.product_name,
    pv.size,
    pv.stock_quantity,
    p.price as base_price,
    (p.price + pv.price_adjustment) as final_price
FROM products p
JOIN product_variants pv ON p.product_id = pv.product_id
WHERE pv.barcode = 'PROD000001VAR0001';
```

### Monitor Stok Menipis
```sql
SELECT 
    p.product_name,
    pv.size,
    pv.stock_quantity,
    pv.barcode
FROM products p
JOIN product_variants pv ON p.product_id = pv.product_id
WHERE pv.stock_quantity < 10
ORDER BY pv.stock_quantity ASC;
```

### Update Stok berdasarkan Barcode
```sql
UPDATE product_variants 
SET stock_quantity = stock_quantity - 1
WHERE barcode = 'PROD000001VAR0001';
```

## ⚠️ Hal yang Perlu Diperhatikan

### 1. Update Aplikasi Web
- Ubah kode untuk menggunakan barcode dari `product_variants`
- Update form input produk untuk menangani variant
- Update sistem scan barcode

### 2. Testing
- Test semua fitur yang menggunakan barcode
- Test insert/update/delete variant
- Test pencarian berdasarkan barcode

### 3. Backup Rutin
- Backup database setiap hari
- Simpan backup di lokasi aman

## 🎯 Keuntungan Sistem Baru

✅ **Barcode unik per ukuran** - Tidak ada konflik  
✅ **Stok terpisah** - Track stok per ukuran  
✅ **Harga fleksibel** - Bisa beda harga per variant  
✅ **SKU mudah dibaca** - Format yang user-friendly  
✅ **Auto-generate** - Tidak perlu input manual  
✅ **Index optimal** - Performa query cepat  
✅ **Tracking lengkap** - Timestamp untuk audit  

## 🔄 Rollback (Jika Perlu)

Jika ada masalah, bisa rollback ke struktur lama:
```sql
-- Restore dari backup
DROP TABLE products;
RENAME TABLE products_backup TO products;

DROP TABLE product_variants;
RENAME TABLE product_variants_backup TO product_variants;
```

## 📞 Support

Jika ada pertanyaan atau masalah:
1. Cek log error MySQL
2. Pastikan semua script berhasil dijalankan
3. Test dengan data sample terlebih dahulu
4. Backup sebelum melakukan perubahan besar

---

**Selamat! Database Anda sekarang mendukung barcode unik per ukuran produk.** 🎉 