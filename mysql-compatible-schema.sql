-- =====================================================
-- MYSQL SCHEMA: Fashion Park Inventory System
-- Compatible with existing MySQL database
-- =====================================================

-- ================= USER & AUTH =================
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    province_id INT,
    province_name VARCHAR(100),
    city_id INT,
    city_name VARCHAR(100),
    district_id INT,
    district_name VARCHAR(100),
    village_id INT,
    village_name VARCHAR(100),
    postal_code VARCHAR(20),
    address_detail TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    role ENUM('admin', 'kasir', 'pemilik', 'pelanggan') NOT NULL DEFAULT 'pelanggan',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- ================= CATEGORY =================
CREATE TABLE IF NOT EXISTS categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ================= PRODUCT =================
CREATE TABLE IF NOT EXISTS products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    barcode VARCHAR(100),
    image_url VARCHAR(255),
    category_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL
);

-- ================= PRODUCT VARIANT =================
CREATE TABLE IF NOT EXISTS product_variants (
    variant_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    size VARCHAR(10) NOT NULL,
    stock_quantity INT DEFAULT 0,
    barcode VARCHAR(100) UNIQUE,
    sku VARCHAR(100) UNIQUE,
    price_adjustment DECIMAL(10,2) DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- ================= PRODUCT IMAGE =================
CREATE TABLE IF NOT EXISTS product_images (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image LONGBLOB,
    mime_type VARCHAR(50),
    image_url VARCHAR(255),
    image_order INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- ================= TRANSACTION =================
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_code VARCHAR(50) NOT NULL,
    user_id INT,
    cashier_id INT,
    total_amount DECIMAL(12,2) NOT NULL,
    discount DECIMAL(12,2) DEFAULT 0,
    final_amount DECIMAL(12,2) NOT NULL,
    payment_method ENUM('cash', 'digital', 'qris') NOT NULL,
    payment_status ENUM('pending', 'success', 'failed') NOT NULL DEFAULT 'pending',
    status VARCHAR(50) DEFAULT 'menunggu pembayaran',
    waybill_number VARCHAR(100),
    courier VARCHAR(100),
    payment_reference VARCHAR(100),
    midtrans_fee DECIMAL(12,2) DEFAULT 0,
    midtrans_status VARCHAR(50),
    transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (cashier_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ================= TRANSACTION DETAIL =================
CREATE TABLE IF NOT EXISTS transaction_details (
    detail_id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    product_id INT,
    variant_id INT,
    quantity INT NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE SET NULL,
    FOREIGN KEY (variant_id) REFERENCES product_variants(variant_id) ON DELETE SET NULL
);

-- ================= STOCK MOVEMENT =================
CREATE TABLE IF NOT EXISTS stock_movements (
    movement_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    user_id INT,
    movement_type ENUM('in', 'out', 'adjustment') NOT NULL,
    quantity INT NOT NULL,
    notes TEXT,
    movement_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ================= CART =================
CREATE TABLE IF NOT EXISTS cart (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    variant_id INT,
    quantity INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(variant_id) ON DELETE SET NULL
);

-- ================= PASSWORD RESETS =================
CREATE TABLE IF NOT EXISTS password_resets (
    email VARCHAR(255) PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    expires BIGINT NOT NULL
);

-- ================= NOTIFICATIONS =================
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ================= REFUNDS =================
CREATE TABLE IF NOT EXISTS refunds (
    refund_id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    initiated_by INT,
    approved_by INT,
    initiated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    approved_at DATETIME,
    notes TEXT,
    FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id) ON DELETE CASCADE,
    FOREIGN KEY (initiated_by) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ================= ADDRESS TABLES =================
CREATE TABLE IF NOT EXISTS provinces (
    province_id INT PRIMARY KEY,
    province_name VARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cities (
    city_id INT PRIMARY KEY,
    city_name VARCHAR(100) NOT NULL,
    province_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (province_id) REFERENCES provinces(province_id)
);

CREATE TABLE IF NOT EXISTS districts (
    district_id INT PRIMARY KEY,
    district_name VARCHAR(100) NOT NULL,
    city_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(city_id)
);

CREATE TABLE IF NOT EXISTS villages (
    village_id INT PRIMARY KEY,
    village_name VARCHAR(100) NOT NULL,
    district_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (district_id) REFERENCES districts(district_id)
);

CREATE TABLE IF NOT EXISTS postal_codes (
    postal_code_id INT AUTO_INCREMENT PRIMARY KEY,
    postal_code VARCHAR(10) NOT NULL,
    village_id INT NOT NULL,
    district_id INT NOT NULL,
    city_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (village_id) REFERENCES villages(village_id),
    FOREIGN KEY (district_id) REFERENCES districts(district_id),
    FOREIGN KEY (city_id) REFERENCES cities(city_id)
);

-- ================= INDEXES =================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_product_variants_product ON product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);
CREATE INDEX idx_product_variants_barcode ON product_variants(barcode);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transaction_details_transaction ON transaction_details(transaction_id);
CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_cart_user ON cart(user_id);
CREATE INDEX idx_refunds_transaction ON refunds(transaction_id);
CREATE INDEX idx_refunds_status ON refunds(status);

-- ================= FUNCTIONS =================
DELIMITER //
CREATE FUNCTION generate_product_sku(p_product_id INT, p_size VARCHAR(10), p_variant_id INT) 
RETURNS VARCHAR(100)
READS SQL DATA
DETERMINISTIC
BEGIN
    RETURN CONCAT('SKU', LPAD(p_product_id, 6, '0'), '-', UPPER(p_size), '-', LPAD(p_variant_id, 4, '0'));
END//
DELIMITER ;

-- ================= TRIGGERS =================
DELIMITER //
CREATE TRIGGER before_product_variant_insert_sku 
    BEFORE INSERT ON product_variants
    FOR EACH ROW 
BEGIN
    IF NEW.sku IS NULL OR NEW.sku = '' THEN
        SET NEW.sku = generate_product_sku(NEW.product_id, NEW.size, NEW.variant_id);
    END IF;
END//
DELIMITER ;

-- ================= SAMPLE DATA =================
-- Insert sample categories
INSERT INTO categories (category_name, description) VALUES
('Pakaian Pria', 'Koleksi pakaian untuk pria'),
('Pakaian Wanita', 'Koleksi pakaian untuk wanita'),
('Aksesoris', 'Aksesoris fashion dan gaya'),
('Sepatu', 'Koleksi sepatu dan alas kaki');

-- Insert sample products
INSERT INTO products (product_name, description, price, stock_quantity, category_id) VALUES
('Kaos Polos Premium', 'Kaos polos berkualitas tinggi dengan bahan premium', 150000.00, 50, 1),
('Celana Jeans Slim Fit', 'Celana jeans dengan model slim fit yang nyaman', 250000.00, 30, 1),
('Dress Casual', 'Dress casual yang elegan untuk berbagai acara', 300000.00, 25, 2);

-- Insert sample product variants
INSERT INTO product_variants (product_id, size, stock_quantity, barcode) VALUES
(1, 'S', 10, 'PROD000001VAR0001'),
(1, 'M', 15, 'PROD000001VAR0002'),
(1, 'L', 8, 'PROD000001VAR0003'),
(1, 'XL', 5, 'PROD000001VAR0004'),
(2, '30', 12, 'PROD000002VAR0001'),
(2, '32', 18, 'PROD000002VAR0002'),
(2, '34', 10, 'PROD000002VAR0003'),
(3, 'S', 8, 'PROD000003VAR0001'),
(3, 'M', 12, 'PROD000003VAR0002'),
(3, 'L', 6, 'PROD000003VAR0003');

-- Insert sample provinces and cities
INSERT INTO provinces (province_id, province_name) VALUES
(32, 'Sumatera Barat'),
(7, 'Jawa Barat'),
(8, 'Jawa Tengah'),
(1, 'Bali'),
(12, 'Kalimantan Barat');

INSERT INTO cities (city_id, city_name, province_id) VALUES
(440, 'Kota Padang', 32),
(441, 'Kota Bukittinggi', 32),
(442, 'Kota Padang Panjang', 32),
(443, 'Kota Pariaman', 32),
(444, 'Kota Payakumbuh', 32),
(445, 'Kota Solok', 32),
(446, 'Kota Sawah Lunto', 32),
(447, 'Kabupaten Padang Pariaman', 32),
(448, 'Kabupaten Agam', 32),
(449, 'Kabupaten Lima Puluh Kota', 32),
(450, 'Kabupaten Pasaman', 32),
(451, 'Kabupaten Solok', 32),
(452, 'Kabupaten Sijunjung', 32),
(453, 'Kabupaten Tanah Datar', 32),
(454, 'Kabupaten Dharmasraya', 32),
(455, 'Kabupaten Kepulauan Mentawai', 32),
(456, 'Kabupaten Pasaman Barat', 32),
(457, 'Kabupaten Solok Selatan', 32);

-- ================= COMMENTS =================
-- Tabel untuk menyimpan data pengguna sistem
-- Tabel untuk kategori produk
-- Tabel untuk produk utama
-- Tabel untuk varian produk (ukuran, stok)
-- Tabel untuk transaksi penjualan
-- Tabel detail item dalam transaksi
-- Tabel keranjang belanja pengguna
-- Tabel untuk tracking pergerakan stok
-- Tabel untuk pengembalian dana
-- Tabel untuk notifikasi pengguna
-- Tabel data provinsi Indonesia
-- Tabel data kota/kabupaten Indonesia
-- Tabel data kecamatan Indonesia
-- Tabel data desa/kelurahan Indonesia
-- Tabel data kode pos Indonesia

-- ================= FINAL NOTES =================
/*
SCHEMA SUDAH SIAP UNTUK MYSQL!

Fitur yang tersedia:
1. Struktur tabel lengkap untuk sistem inventory fashion
2. Triggers untuk auto-generate SKU
3. Sample data untuk testing
4. Indexes untuk performa optimal
5. Foreign key constraints untuk integritas data
6. Enums untuk validasi data

Langkah selanjutnya:
1. Jalankan file ini di MySQL database Anda
2. Test dengan aplikasi frontend
3. Sesuaikan aplikasi dengan struktur tabel ini
4. Deploy ke production
*/
