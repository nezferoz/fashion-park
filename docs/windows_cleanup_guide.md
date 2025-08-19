# Panduan Cleanup Database untuk Windows

## **🔧 Solusi untuk Masalah mysqldump di Windows**

### **Masalah yang Ditemui:**
```
bash: mysqldump: command not found
```

### **Solusi Alternatif:**

## **📋 Metode 1: Menggunakan phpMyAdmin (Direkomendasikan)**

### **Langkah-langkah:**

#### **1. Backup Database**
1. Buka phpMyAdmin di browser (biasanya `http://localhost/phpmyadmin`)
2. Pilih database Anda dari sidebar kiri
3. Klik tab **"Export"**
4. Pilih **"Custom"** export method
5. Pastikan semua tabel tercentang
6. Klik **"Go"** untuk download backup

#### **2. Jalankan Script Cleanup**
1. Di phpMyAdmin, klik tab **"SQL"**
2. Copy dan paste isi file `safe_cleanup_tables.sql`
3. Klik **"Go"** untuk menjalankan query

#### **3. Verifikasi Hasil**
1. Jalankan query ini untuk melihat tabel yang tersisa:
```sql
SHOW TABLES;
```

## **📋 Metode 2: Menggunakan MySQL Workbench**

### **Langkah-langkah:**

#### **1. Backup Database**
1. Buka MySQL Workbench
2. Connect ke database Anda
3. Menu **Server** → **Data Export**
4. Pilih database Anda
5. Pilih **"Export to Self-Contained File"**
6. Klik **"Start Export"**

#### **2. Jalankan Script Cleanup**
1. Buka tab **"Query Editor"**
2. Copy dan paste isi file `safe_cleanup_tables.sql`
3. Klik tombol petir (⚡) untuk execute

## **📋 Metode 3: Menggunakan Command Line**

### **Jika MySQL terinstall di PATH:**

#### **1. Cek instalasi MySQL**
```cmd
mysql --version
```

#### **2. Backup database**
```cmd
mysqldump -u root -p nama_database > backup.sql
```

#### **3. Jalankan script cleanup**
```cmd
mysql -u root -p nama_database < safe_cleanup_tables.sql
```

### **Jika MySQL tidak di PATH:**

#### **1. Cari lokasi MySQL**
```cmd
dir "C:\Program Files\MySQL" /s /b | findstr mysqldump.exe
```

#### **2. Gunakan path lengkap**
```cmd
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe" -u root -p nama_database > backup.sql
```

## **📋 Metode 4: Menggunakan XAMPP/WAMP**

### **Jika menggunakan XAMPP:**

#### **1. Backup via phpMyAdmin**
1. Buka `http://localhost/phpmyadmin`
2. Export database seperti di Metode 1

#### **2. Jalankan script via phpMyAdmin**
1. Buka tab SQL
2. Copy paste script cleanup
3. Execute

## **⚠️ Langkah-langkah Aman:**

### **1. Backup Terlebih Dahulu**
- **WAJIB** backup database sebelum melakukan cleanup
- Simpan backup di lokasi yang aman

### **2. Jalankan Script Pengecekan**
```sql
-- Jalankan ini terlebih dahulu
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
ORDER BY table_name;
```

### **3. Cek Foreign Key**
```sql
-- Cek apakah ada foreign key ke tabel yang akan dihapus
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE REFERENCED_TABLE_SCHEMA = DATABASE()
AND REFERENCED_TABLE_NAME IN ('refunds', 'system_settings');
```

### **4. Hapus Tabel Secara Bertahap**
```sql
-- Hapus satu per satu
DROP TABLE IF EXISTS refunds;
-- Test aplikasi
-- Jika aman, lanjut ke tabel berikutnya
DROP TABLE IF EXISTS system_settings;
```

### **5. Test Aplikasi**
- Restart backend server
- Test semua fitur utama
- Pastikan tidak ada error

## **🔧 Troubleshooting:**

### **Error "Access Denied"**
```sql
-- Pastikan user memiliki privilege yang cukup
GRANT ALL PRIVILEGES ON nama_database.* TO 'username'@'localhost';
FLUSH PRIVILEGES;
```

### **Error "Table doesn't exist"**
- Ini normal jika tabel memang tidak ada
- Script menggunakan `DROP TABLE IF EXISTS` jadi aman

### **Error Foreign Key**
- Jangan hapus tabel jika ada foreign key yang mengacu
- Cek dulu dengan query di atas

## **📝 File yang Tersedia:**

1. **`safe_cleanup_tables.sql`** - Script cleanup yang aman
2. **`cleanup_unused_tables.sql`** - Script cleanup lengkap
3. **`docs/database_analysis.md`** - Analisis lengkap database

## **✅ Checklist Sebelum Cleanup:**

- [ ] Backup database sudah dibuat
- [ ] Script pengecekan sudah dijalankan
- [ ] Tidak ada foreign key yang mengacu ke tabel yang akan dihapus
- [ ] Aplikasi sudah di-test setelah cleanup
- [ ] Backup baru dibuat setelah cleanup

## **🎯 Kesimpulan:**

**Metode yang Direkomendasikan:** Gunakan phpMyAdmin karena:
- Mudah digunakan
- Visual interface
- Tidak perlu command line
- Built-in backup dan restore
- Aman dan reliable
