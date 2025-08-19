-- =====================================================
-- ADDITIONAL MIGRATION: Tambah Kolom yang Diperlukan
-- =====================================================

-- 1. Kolom color dihapus karena tidak diperlukan
-- ALTER TABLE product_variants 
-- ADD COLUMN color VARCHAR(50) DEFAULT 'Default';

-- 2. Tambah kolom untuk harga per variant (opsional)
ALTER TABLE product_variants 
ADD COLUMN price_adjustment DECIMAL(10,2) DEFAULT 0.00;

-- 3. Tambah kolom untuk SKU per variant
ALTER TABLE product_variants 
ADD COLUMN sku VARCHAR(100) UNIQUE;

-- 4. Generate SKU otomatis untuk variant yang sudah ada
UPDATE product_variants 
SET sku = CONCAT('SKU', LPAD(product_id, 6, '0'), '-', UPPER(size), '-', LPAD(variant_id, 4, '0'))
WHERE sku IS NULL OR sku = '';

-- 5. Tambah index untuk SKU
CREATE INDEX idx_product_variants_sku ON product_variants(sku);

-- 6. HAPUS KOLOM STOCK_QUANTITY DARI TABEL PRODUCTS
-- Karena stok seharusnya dikelola di level variant
ALTER TABLE products DROP COLUMN stock_quantity;

-- =====================================================
-- TAMBAHAN: KOLOM STATUS DAN SHIPPING UNTUK TRANSACTIONS
-- =====================================================

-- 7. Tambah kolom status untuk tracking pesanan
ALTER TABLE transactions 
ADD COLUMN status ENUM('menunggu pembayaran', 'diproses', 'dikirim', 'selesai', 'dibatalkan') 
DEFAULT 'menunggu pembayaran' AFTER payment_status;

-- 8. Tambah kolom waybill_number untuk nomor resi
ALTER TABLE transactions 
ADD COLUMN waybill_number VARCHAR(100) NULL AFTER status;

-- 9. Tambah kolom courier untuk nama kurir
ALTER TABLE transactions 
ADD COLUMN courier VARCHAR(100) NULL AFTER waybill_number;

-- 10. Update status default untuk transaksi yang sudah ada
UPDATE transactions 
SET status = CASE 
  WHEN payment_status = 'success' THEN 'diproses'
  WHEN payment_status = 'pending' THEN 'menunggu pembayaran'
  WHEN payment_status = 'failed' THEN 'dibatalkan'
  ELSE 'menunggu pembayaran'
END
WHERE status IS NULL;

-- =====================================================
-- SISTEM REFUND
-- =====================================================

-- 11. Buat tabel refunds
CREATE TABLE IF NOT EXISTS refunds (
  refund_id INT AUTO_INCREMENT PRIMARY KEY,
  transaction_id INT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  reason TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  initiated_by INT,
  approved_by INT NULL,
  initiated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  approved_at DATETIME NULL,
  notes TEXT,
  FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id) ON DELETE CASCADE,
  FOREIGN KEY (initiated_by) REFERENCES users(user_id) ON DELETE SET NULL,
  FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- 12. Tambah index untuk refunds
CREATE INDEX idx_refunds_transaction_id ON refunds(transaction_id);
CREATE INDEX idx_refunds_status ON refunds(status);

-- =====================================================
-- FUNGSI UNTUK GENERATE SKU OTOMATIS
-- =====================================================

DELIMITER $$

CREATE FUNCTION generate_product_sku(product_id INT, size VARCHAR(10), variant_id INT) 
RETURNS VARCHAR(100)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE sku VARCHAR(100);
    SET sku = CONCAT('SKU', LPAD(product_id, 6, '0'), '-', UPPER(size), '-', LPAD(variant_id, 4, '0'));
    RETURN sku;
END$$

DELIMITER ;

-- =====================================================
-- TRIGGER UNTUK AUTO-GENERATE SKU
-- =====================================================

DELIMITER $$

CREATE TRIGGER before_product_variant_insert_sku 
BEFORE INSERT ON product_variants
FOR EACH ROW
BEGIN
    IF NEW.sku IS NULL OR NEW.sku = '' THEN
        SET NEW.sku = generate_product_sku(NEW.product_id, NEW.size, NEW.variant_id);
    END IF;
END$$

DELIMITER ;

-- =====================================================
-- TRIGGER UNTUK AUTO-UPDATE STATUS SAAT PAYMENT SUCCESS
-- =====================================================

DELIMITER $$

CREATE TRIGGER after_transaction_payment_success
AFTER UPDATE ON transactions
FOR EACH ROW
BEGIN
    -- Jika payment_status berubah dari pending ke success, update status ke 'diproses'
    IF OLD.payment_status = 'pending' AND NEW.payment_status = 'success' THEN
        UPDATE transactions 
        SET status = 'diproses' 
        WHERE transaction_id = NEW.transaction_id;
    END IF;
    
    -- Jika payment_status berubah ke failed, update status ke 'dibatalkan'
    IF OLD.payment_status = 'pending' AND NEW.payment_status = 'failed' THEN
        UPDATE transactions 
        SET status = 'dibatalkan' 
        WHERE transaction_id = NEW.transaction_id;
    END IF;
END$$

DELIMITER ;

-- =====================================================
-- CONTOH DATA UNTUK TESTING
-- =====================================================

/*
-- Contoh insert data baru
INSERT INTO products (product_name, description, price, category_id, is_active) 
VALUES ('Kaos Polos Premium', 'Kaos polos berkualitas tinggi', 150000.00, 1, 1);

-- Ambil product_id yang baru dibuat
SET @new_product_id = LAST_INSERT_ID();

-- Insert variants dengan barcode otomatis
INSERT INTO product_variants (product_id, size, stock_quantity) VALUES
(@new_product_id, 'S', 10),
(@new_product_id, 'M', 15),
(@new_product_id, 'L', 8),
(@new_product_id, 'XL', 5);

-- Cek hasil
SELECT 
    p.product_name,
    pv.size,
    pv.barcode,
    pv.sku,
    pv.stock_quantity
FROM products p
JOIN product_variants pv ON p.product_id = pv.product_id
WHERE p.product_id = @new_product_id
ORDER BY pv.size;
*/

-- =====================================================
-- QUERY UNTUK MONITORING STOK
-- =====================================================

-- Query untuk melihat stok yang menipis (kurang dari 10)
/*
SELECT 
    p.product_name,
    pv.size,
    pv.stock_quantity,
    pv.barcode,
    pv.sku
FROM products p
JOIN product_variants pv ON p.product_id = pv.product_id
WHERE pv.stock_quantity < 10
ORDER BY pv.stock_quantity ASC;
*/

-- Query untuk mencari produk berdasarkan barcode
/*
SELECT 
    p.product_name,
    pv.size,
    pv.stock_quantity,
    p.price as base_price,
    (p.price + pv.price_adjustment) as final_price
FROM products p
JOIN product_variants pv ON p.product_id = pv.product_id
WHERE pv.barcode = 'PROD000001VAR0001';
*/

-- =====================================================
-- CATATAN PENTING
-- =====================================================

/*
FORMAT BARCODE: PROD{product_id}VAR{variant_id}
FORMAT SKU: SKU{product_id}-{SIZE}-{variant_id}

CONTOH:
- Barcode: PROD000001VAR0001
- SKU: SKU000001-S-0001

KEUNTUNGAN SISTEM INI:
1. Barcode unik per ukuran/warna
2. SKU mudah dibaca dan dipahami
3. Stok terpisah per variant
4. Harga bisa berbeda per variant
5. Tracking lengkap dengan timestamp
6. Index untuk performa optimal
7. Status pesanan yang jelas
8. Sistem refund yang terintegrasi

LANGKAH SELANJUTNYA:
1. Jalankan script ini di database Anda
2. Test dengan data sample
3. Update aplikasi web untuk menggunakan struktur baru
4. Backup database secara berkala
*/
