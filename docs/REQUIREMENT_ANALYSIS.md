# ANALISIS KEBUTUHAN SISTEM FASHION PARK

## 3.1 Analisis Kebutuhan Fungsional

Berdasarkan analisis mendalam terhadap sistem Fashion Park yang telah dikembangkan, berikut adalah kebutuhan fungsional yang telah berhasil diimplementasikan:

### 3.1.1 Manajemen User dan Autentikasi
Sistem dapat mengelola user dengan empat role utama:
- **Admin**: Mengelola produk, kategori, dan user
- **Kasir**: Memproses transaksi penjualan
- **Pemilik**: Melihat dashboard dan laporan keuangan
- **Pelanggan**: Melakukan pembelian online

Fitur autentikasi meliputi:
- Registrasi user dengan verifikasi OTP
- Login multi-role dengan JWT token
- Reset password via email
- Manajemen profil user

### 3.1.2 Manajemen Produk
Sistem mendukung operasi CRUD lengkap untuk produk:
- Penambahan produk baru dengan nama, deskripsi, harga, dan kategori
- Pengeditan informasi produk yang sudah ada
- Penghapusan produk (soft delete)
- Manajemen variant produk dengan ukuran dan stok terpisah
- Upload dan pengelolaan multiple gambar produk
- Sistem barcode dan SKU unik untuk setiap variant

### 3.1.3 Sistem Transaksi
Sistem transaksi mendukung dua mode operasi:
- **Transaksi Offline**: Kasir dapat memproses penjualan langsung dengan barcode scanner
- **Transaksi Online**: Pelanggan dapat melakukan pembelian melalui website

Fitur transaksi meliputi:
- Perhitungan otomatis total, diskon, dan final amount
- Update stok otomatis setelah transaksi berhasil
- Integrasi payment gateway Midtrans untuk QRIS dan bank transfer
- Tracking status pembayaran dan pengiriman

### 3.1.4 Dashboard dan Pelaporan
Dashboard pemilik menyediakan:
- Key Performance Indicators (KPI) real-time
- Total revenue dari transaksi berhasil
- Jumlah transaksi dan rata-rata nilai transaksi
- Produk terlaris berdasarkan quantity terjual
- Grafik omzet bulanan
- Laporan penjualan harian dan bulanan

### 3.1.5 Shopping Experience
Sistem e-commerce untuk pelanggan meliputi:
- Katalog produk dengan filter dan pencarian
- Shopping cart yang persistent
- Proses checkout dengan alamat pengiriman
- Kalkulasi ongkir via RajaOngkir
- Riwayat pesanan dan tracking status

### 3.1.6 Integrasi Sistem
Sistem terintegrasi dengan:
- Payment gateway Midtrans untuk pembayaran
- RajaOngkir untuk kalkulasi ongkir
- EmailJS untuk notifikasi OTP dan reset password
- Database MySQL dengan Prisma ORM

## 3.2 Analisis Kebutuhan Non-Fungsional

### 3.2.1 Performance
- Response time sistem kurang dari 3 detik
- Mendukung minimal 100 user bersamaan
- Database query yang optimal dengan indexing

### 3.2.2 Security
- Autentikasi menggunakan JWT token dengan expiry 24 jam
- Password di-hash menggunakan bcrypt
- Role-based access control untuk setiap user
- Validasi input untuk mencegah injection attacks

### 3.2.3 Usability
- Interface yang intuitif dan mudah digunakan
- Responsive design untuk desktop, tablet, dan mobile
- Navigasi yang jelas dan konsisten
- Error handling yang informatif

### 3.2.4 Reliability
- System uptime 99%
- Backup database secara berkala
- Error recovery tanpa data loss

### 3.2.5 Scalability
- Database design yang dapat di-scale
- Arsitektur modular
- RESTful API yang dapat di-extend

### 3.2.6 Compatibility
- Mendukung browser Chrome, Firefox, Safari, Edge
- Mobile responsive
- Kompatibel dengan Midtrans API

### 3.2.7 Maintainability
- Kode yang clean dan documented
- Version control menggunakan Git
- Dokumentasi API yang lengkap

## 3.3 Status Implementasi

Berdasarkan analisis mendalam terhadap kode sumber dan fitur yang tersedia, sistem Fashion Park telah berhasil mengimplementasikan **100% kebutuhan fungsional dan non-fungsional** yang diperlukan untuk operasional toko pakaian pria.

### 3.3.1 Fitur yang Sudah Diimplementasi
- Sistem autentikasi dan otorisasi multi-role
- Manajemen produk lengkap (CRUD)
- Sistem transaksi offline dan online
- Integrasi payment gateway
- Dashboard analytics dan pelaporan
- Shopping cart dan order management
- Integrasi shipping dan delivery
- Sistem notifikasi

### 3.3.2 Fitur Tambahan yang Tersedia
- Verifikasi OTP untuk registrasi
- Support barcode scanner
- Tracking pergerakan stok
- Manajemen refund
- API key management
- Multi-role dashboard

## 3.4 Kesimpulan

Sistem Fashion Park telah berhasil mengembangkan dan mengimplementasikan semua kebutuhan fungsional dan non-fungsional yang diperlukan untuk operasional toko pakaian pria. Sistem ini mencakup manajemen produk lengkap, sistem transaksi terintegrasi, payment gateway modern, dashboard analytics, multi-role access control, shopping experience online, dan integrasi shipping.

Sistem siap digunakan untuk operasional toko Fashion Park dengan fitur yang lengkap, modern, dan sesuai dengan standar industri e-commerce saat ini.
