# Analisis Database - Tabel yang Dapat Dihapus

## **📊 Ringkasan Analisis**

Setelah memeriksa seluruh codebase, berikut adalah analisis tabel-tabel di database:

### **🔴 Tabel yang DAPAT DIHAPUS (Tidak Digunakan):**

#### **1. `refunds`**
- **Status:** ❌ **TIDAK DIGUNAKAN SAMA SEKALI**
- **Alasan:** Tidak ada controller, model, atau route yang menggunakan tabel ini
- **Rekomendasi:** **HAPUS** - aman untuk dihapus
- **Query:**
```sql
DROP TABLE IF EXISTS refunds;
```

#### **2. `system_settings` (Opsional)**
- **Status:** ⚠️ **DIGUNAKAN SEDIKIT**
- **Penggunaan:** 
  - `rajaongkirController.js` (line 513, 547)
  - `shippingController.js` (line 94)
- **Data yang disimpan:** Setting pengirim untuk shipping
- **Rekomendasi:** Jika tidak ada data penting, bisa dihapus dan setting dipindah ke environment variables
- **Query:**
```sql
-- Cek data terlebih dahulu
SELECT * FROM system_settings;

-- Jika tidak ada data penting, hapus
DROP TABLE IF EXISTS system_settings;
```

### **🟡 Tabel yang PERLU DIPERIKSA:**

#### **1. `password_resets`**
- **Status:** ✅ **DIGUNAKAN**
- **Penggunaan:** `authController.js` (lines 60, 62, 64, 80, 91)
- **Fungsi:** Reset password user
- **Rekomendasi:** **JANGAN HAPUS** - masih digunakan

#### **2. `api_keys`**
- **Status:** ✅ **DIGUNAKAN**
- **Penggunaan:** 
  - `apiKeyModel.js` (lines 5, 15, 21, 31, 38, 46)
  - `rajaongkirController.js`
- **Fungsi:** Menyimpan API key untuk layanan eksternal
- **Rekomendasi:** **JANGAN HAPUS** - masih digunakan

### **🟢 Tabel yang AKTIF DIGUNAKAN (JANGAN HAPUS):**

#### **Tabel Utama:**
- `users` ✅ - User management
- `categories` ✅ - Product categories
- `products` ✅ - Product data
- `product_variants` ✅ - Product variants/sizes
- `product_images` ✅ - Product images
- `transactions` ✅ - Sales transactions
- `transaction_details` ✅ - Transaction items
- `cart` ✅ - Shopping cart
- `stock_movements` ✅ - Stock tracking
- `notifications` ✅ - User notifications

## **📋 Detail Penggunaan Tabel:**

### **Tabel yang Digunakan di Frontend:**
- `users` - Login, profile, user management
- `products` + `product_variants` - Product catalog, kasir
- `transactions` + `transaction_details` - Sales history, reports
- `cart` - Shopping cart functionality
- `notifications` - User notifications

### **Tabel yang Digunakan di Backend:**
- `categories` - Product categorization
- `stock_movements` - Stock management
- `password_resets` - Password reset functionality
- `api_keys` - External service integration
- `system_settings` - Shipping configuration

## **🚀 Langkah-langkah Menghapus Tabel:**

### **1. Backup Database (WAJIB)**
```bash
mysqldump -u username -p database_name > backup_before_cleanup.sql
```

### **2. Jalankan Script Cleanup**
```bash
mysql -u username -p database_name < cleanup_unused_tables.sql
```

### **3. Verifikasi Hasil**
```sql
-- Cek tabel yang tersisa
SHOW TABLES;

-- Cek foreign key constraints
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE REFERENCED_TABLE_SCHEMA = DATABASE()
AND REFERENCED_TABLE_NAME IS NOT NULL;
```

### **4. Test Aplikasi**
- Restart backend server
- Test semua fitur utama:
  - Login/Register
  - Product management
  - Kasir functionality
  - Shopping cart
  - Reports
  - RajaOngkir integration

## **⚠️ Peringatan Penting:**

### **JANGAN HAPUS:**
- `users` - Sistem akan crash
- `products` - Semua fitur produk akan rusak
- `transactions` - Data penjualan akan hilang
- `product_variants` - Stok management akan rusak
- `cart` - Shopping cart akan rusak

### **AMAN DIHAPUS:**
- `refunds` - Tidak digunakan sama sekali
- `system_settings` - Jika tidak ada data penting

## **📈 Manfaat Setelah Cleanup:**

1. **Database lebih kecil** - Menghemat storage
2. **Query lebih cepat** - Kurang tabel = lebih cepat
3. **Maintenance lebih mudah** - Kurang kompleksitas
4. **Backup lebih cepat** - Data lebih sedikit

## **🔧 Jika Terjadi Error:**

### **Error Foreign Key:**
```sql
-- Cek foreign key yang bermasalah
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE REFERENCED_TABLE_SCHEMA = DATABASE()
AND REFERENCED_TABLE_NAME IN ('refunds', 'system_settings');
```

### **Restore dari Backup:**
```bash
mysql -u username -p database_name < backup_before_cleanup.sql
```

## **📝 Catatan Tambahan:**

- Script `cleanup_unused_tables.sql` sudah dibuat dengan aman
- Semua query menggunakan `DROP TABLE IF EXISTS` untuk keamanan
- Optimize table dilakukan setelah cleanup
- Backup otomatis sebelum cleanup

**Kesimpulan:** Hanya tabel `refunds` yang benar-benar aman untuk dihapus. Tabel `system_settings` bisa dihapus jika tidak ada data penting.
