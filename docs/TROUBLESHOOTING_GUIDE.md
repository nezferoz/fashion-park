# Troubleshooting Guide - Stock Management & Image Issues

## Masalah yang Sering Dijumpai

### 1. Error 404 saat Update Stok
**Gejala:**
- Console menampilkan: "Failed to load resource: the server responded with a status of 404 (Not Found)"
- Modal update stok tidak berfungsi
- Error: "Gagal mengupdate stok"

**Penyebab:**
- Route tidak terdaftar dengan benar
- Middleware auth/role bermasalah
- Database tidak memiliki variant untuk produk

**Solusi:**
1. Jalankan script perbaikan database:
   ```bash
   run_all_fixes.bat
   ```
2. Pastikan backend server berjalan
3. Periksa apakah produk memiliki variant di database
4. Verifikasi JWT token valid

### 2. Gambar Tidak Muncul Setelah Upload
**Gejala:**
- Gambar berhasil diupload tapi tidak ditampilkan
- Produk menampilkan placeholder icon
- Error di console tentang gambar

**Penyebab:**
- Field name tidak sesuai (backend mengharapkan 'images')
- MIME type tidak dikenali
- Database tidak menyimpan gambar dengan benar

**Solusi:**
1. Gunakan `test_image_upload.html` untuk test upload
2. Pastikan field name adalah 'images' (bukan 'image')
3. Jalankan perbaikan database structure
4. Gunakan tombol "Buat Gambar Default" untuk produk tanpa gambar

### 3. Status Stok Tidak Konsisten
**Gejala:**
- Summary cards menampilkan angka berbeda dengan tabel
- Status "Habis" tapi stok > 0
- Status "Rendah" untuk stok 0

**Penyebab:**
- Data stok di database tidak konsisten
- Perhitungan total_stock salah
- Produk tidak memiliki variant

**Solusi:**
1. Jalankan `fix_database_structure.sql`
2. Jalankan `fix_stock_status.sql`
3. Restart backend server
4. Clear browser cache

## Langkah-langkah Perbaikan Lengkap

### Langkah 1: Perbaiki Database
```bash
# Jalankan script lengkap
run_all_fixes.bat

# Atau manual:
mysql -u root -p fashion_park < fix_database_structure.sql
mysql -u root -p fashion_park < fix_stock_status.sql
```

### Langkah 2: Restart Backend
```bash
cd backend
npm start
```

### Langkah 3: Test Sistem
1. Buka `test_image_upload.html` di browser
2. Test upload gambar dengan JWT token valid
3. Test update stok di halaman Kelola Stok
4. Verifikasi status stok konsisten

### Langkah 4: Verifikasi Frontend
1. Clear browser cache
2. Logout dan login ulang untuk refresh token
3. Test fitur update stok
4. Test fitur upload gambar

## Debug dan Logging

### Backend Logs
Periksa console backend untuk:
- Request yang masuk
- Error database
- Middleware auth issues
- File upload problems

### Frontend Console
Periksa browser console untuk:
- Network errors
- Authentication errors
- JavaScript errors
- API response errors

### Database Queries
Jalankan query untuk verifikasi:
```sql
-- Cek produk tanpa variant
SELECT p.product_id, p.product_name 
FROM products p 
WHERE NOT EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.product_id);

-- Cek produk tanpa gambar
SELECT p.product_id, p.product_name 
FROM products p 
WHERE NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.product_id);

-- Cek stok yang tidak konsisten
SELECT p.product_id, p.product_name, p.total_stock,
       (SELECT SUM(stock_quantity) FROM product_variants WHERE product_id = p.product_id) as calculated_stock
FROM products p 
WHERE p.total_stock != (SELECT COALESCE(SUM(stock_quantity), 0) FROM product_variants WHERE product_id = p.product_id);
```

## Testing Checklist

### Stock Update Test
- [ ] Buka halaman Kelola Stok
- [ ] Klik tombol edit (pencil) pada produk
- [ ] Pilih ukuran/warna yang sesuai
- [ ] Masukkan jumlah stok
- [ ] Pilih action (add/subtract/set)
- [ ] Klik Update Stok
- [ ] Verifikasi stok berubah
- [ ] Verifikasi status stok update

### Image Upload Test
- [ ] Buka `test_image_upload.html`
- [ ] Masukkan Product ID
- [ ] Masukkan JWT token
- [ ] Pilih file gambar
- [ ] Klik Upload Images
- [ ] Verifikasi gambar muncul
- [ ] Refresh halaman Kelola Stok
- [ ] Verifikasi gambar muncul di tabel

### Stock Status Test
- [ ] Verifikasi Total Produk = jumlah produk
- [ ] Verifikasi Stok Tersedia = produk dengan stok > 10
- [ ] Verifikasi Stok Rendah = produk dengan stok 1-10
- [ ] Verifikasi Stok Habis = produk dengan stok 0
- [ ] Verifikasi status di tabel sesuai dengan summary

## Common Error Messages

### "No token provided"
- JWT token tidak ada di localStorage
- Header Authorization tidak dikirim
- Token expired

### "Forbidden: insufficient role"
- User tidak memiliki permission
- Role tidak sesuai dengan yang dibutuhkan
- Token tidak valid

### "Varian tidak ditemukan"
- Produk tidak memiliki variant di database
- Ukuran/warna tidak sesuai
- Database structure bermasalah

### "Gagal upload gambar"
- Field name tidak sesuai
- File terlalu besar
- MIME type tidak didukung
- Database connection error

## Prevention Tips

1. **Regular Database Maintenance**
   - Jalankan script fix secara berkala
   - Monitor log errors
   - Backup database sebelum update

2. **Frontend Validation**
   - Validasi input sebelum kirim ke API
   - Handle errors dengan graceful
   - Show loading states

3. **Backend Monitoring**
   - Log semua request/response
   - Monitor database performance
   - Set up error alerts

4. **Testing**
   - Test fitur baru sebelum deploy
   - Test dengan berbagai data
   - Test error scenarios

## Support

Jika masih ada masalah setelah menjalankan semua langkah di atas:

1. Periksa log backend dan frontend
2. Jalankan query debug di database
3. Test dengan data minimal
4. Dokumentasikan error yang terjadi
5. Hubungi developer untuk assistance
