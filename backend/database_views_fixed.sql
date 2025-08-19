-- Database Views untuk Menampilkan Nama Tabel dan Kolom dalam Bahasa Indonesia
-- Views ini tidak mengubah struktur database asli, hanya memberikan alias bahasa Indonesia

-- View untuk Pengguna
CREATE OR REPLACE VIEW v_pengguna AS
SELECT 
    userId as id_pengguna,
    name as nama,
    email,
    password as kata_sandi,
    phone as telepon,
    address as alamat,
    province_id as id_provinsi,
    city_id as id_kota,
    district_id as id_kecamatan,
    village_id as id_desa,
    postal_code as kode_pos,
    role as peran,
    isActive as aktif,
    createdAt as tanggal_dibuat,
    updatedAt as tanggal_diupdate
FROM users;

-- View untuk Produk
CREATE OR REPLACE VIEW v_produk AS
SELECT 
    product_id as id_produk,
    product_name as nama_produk,
    description as deskripsi,
    price as harga,
    category_id as id_kategori,
    category_name as nama_kategori,
    created_at as tanggal_dibuat,
    updated_at as tanggal_diupdate
FROM products;

-- View untuk Kategori
CREATE OR REPLACE VIEW v_kategori AS
SELECT 
    category_id as id_kategori,
    category_name as nama_kategori,
    description as deskripsi,
    created_at as tanggal_dibuat,
    updated_at as tanggal_diupdate
FROM categories;

-- View untuk Gambar Produk
CREATE OR REPLACE VIEW v_gambar_produk AS
SELECT 
    image_id as id_gambar,
    product_id as id_produk,
    image_url as url_gambar,
    image_name as nama_gambar,
    image_blob as data_gambar,
    is_primary as utama,
    created_at as tanggal_dibuat
FROM product_images;

-- View untuk Keranjang Belanja
CREATE OR REPLACE VIEW v_keranjang_belanja AS
SELECT 
    cart_id as id_keranjang,
    user_id as id_pengguna,
    product_id as id_produk,
    variant_id as id_variant,
    quantity as jumlah,
    created_at as tanggal_dibuat,
    updated_at as tanggal_diupdate
FROM cart;

-- View untuk Transaksi
CREATE OR REPLACE VIEW v_transaksi AS
SELECT 
    transaction_id as id_transaksi,
    transaction_code as kode_transaksi,
    user_id as id_pengguna,
    cashier_id as id_kasir,
    total_amount as total_bayar,
    discount as diskon,
    final_amount as bayar_akhir,
    payment_method as metode_pembayaran,
    payment_status as status_pembayaran,
    payment_reference as referensi_pembayaran,
    transaction_date as tanggal_transaksi,
    created_at as tanggal_dibuat,
    updated_at as tanggal_diupdate
FROM transactions;

-- View untuk Detail Transaksi
CREATE OR REPLACE VIEW v_detail_transaksi AS
SELECT 
    detail_id as id_detail,
    transaction_id as id_transaksi,
    product_id as id_produk,
    variant_id as id_variant,
    quantity as jumlah,
    unit_price as harga_satuan,
    subtotal as subtotal
FROM transaction_details;

-- View untuk Kunci API
CREATE OR REPLACE VIEW v_kunci_api AS
SELECT 
    id,
    service_name as nama_layanan,
    api_key as kunci_api,
    is_active as aktif,
    created_at as tanggal_dibuat,
    updated_at as tanggal_diupdate
FROM api_keys;

-- View untuk Pengaturan Sistem
CREATE OR REPLACE VIEW v_pengaturan_sistem AS
SELECT 
    id,
    sender_province_id as id_provinsi_pengirim,
    sender_city_id as id_kota_pengirim,
    sender_province_name as nama_provinsi_pengirim,
    sender_city_name as nama_kota_pengirim,
    sender_address as alamat_pengirim,
    created_at as tanggal_dibuat,
    updated_at as tanggal_diupdate
FROM system_settings;

-- View untuk Pergerakan Stok
CREATE OR REPLACE VIEW v_pergerakan_stok AS
SELECT 
    movement_id as id_pergerakan,
    product_id as id_produk,
    movement_type as jenis_pergerakan,
    quantity as jumlah,
    reference as referensi,
    notes as catatan,
    created_at as tanggal_dibuat
FROM stock_movements;

-- View untuk Notifikasi
CREATE OR REPLACE VIEW v_notifikasi AS
SELECT 
    notification_id as id_notifikasi,
    user_id as id_pengguna,
    title as judul,
    message as pesan,
    type as tipe,
    is_read as sudah_dibaca,
    created_at as tanggal_dibuat
FROM notifications;

-- View untuk Laporan Penjualan (Gabungan)
CREATE OR REPLACE VIEW v_laporan_penjualan AS
SELECT 
    t.transaction_id as id_transaksi,
    t.transaction_code as kode_transaksi,
    t.transaction_date as tanggal_transaksi,
    t.total_amount as total_bayar,
    t.final_amount as bayar_akhir,
    t.payment_status as status_pembayaran,
    u.name as nama_kasir,
    p.product_name as nama_produk,
    td.quantity as jumlah,
    td.unit_price as harga_satuan,
    td.subtotal as subtotal
FROM transactions t
LEFT JOIN users u ON t.cashier_id = u.userId
LEFT JOIN transaction_details td ON t.transaction_id = td.transaction_id
LEFT JOIN products p ON td.product_id = p.product_id;

-- View untuk Dashboard KPI
CREATE OR REPLACE VIEW v_dashboard_kpi AS
SELECT 
    COUNT(DISTINCT t.transaction_id) as total_transaksi,
    SUM(t.final_amount) as total_pendapatan,
    AVG(t.final_amount) as rata_rata_transaksi,
    COUNT(DISTINCT t.user_id) as total_pelanggan,
    COUNT(DISTINCT CASE WHEN t.payment_status = 'SUCCESS' THEN t.transaction_id END) as transaksi_berhasil,
    COUNT(DISTINCT CASE WHEN t.payment_status = 'PENDING' THEN t.transaction_id END) as transaksi_pending
FROM transactions t
WHERE t.transaction_date >= DATE_SUB(NOW(), INTERVAL 30 DAY);

-- Menampilkan daftar semua views yang telah dibuat
SELECT 'v_pengguna' as nama_view, 'Pengguna' as deskripsi
UNION ALL
SELECT 'v_produk', 'Produk'
UNION ALL
SELECT 'v_kategori', 'Kategori'
UNION ALL
SELECT 'v_gambar_produk', 'Gambar Produk'
UNION ALL
SELECT 'v_keranjang_belanja', 'Keranjang Belanja'
UNION ALL
SELECT 'v_transaksi', 'Transaksi'
UNION ALL
SELECT 'v_detail_transaksi', 'Detail Transaksi'
UNION ALL
SELECT 'v_kunci_api', 'Kunci API'
UNION ALL
SELECT 'v_pengaturan_sistem', 'Pengaturan Sistem'
UNION ALL
SELECT 'v_pergerakan_stok', 'Pergerakan Stok'
UNION ALL
SELECT 'v_notifikasi', 'Notifikasi'
UNION ALL
SELECT 'v_laporan_penjualan', 'Laporan Penjualan'
UNION ALL
SELECT 'v_dashboard_kpi', 'Dashboard KPI'; 