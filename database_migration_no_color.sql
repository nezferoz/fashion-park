-- =====================================================
-- MIGRATION SCRIPT: Barcode per Ukuran (Tanpa Warna)
-- =====================================================

-- 1. Backup data existing (WAJIB!)
CREATE TABLE products_backup AS SELECT * FROM products;
CREATE TABLE product_variants_backup AS SELECT * FROM product_variants;

-- 2. Tambah kolom barcode ke tabel product_variants
ALTER TABLE product_variants 
ADD COLUMN barcode VARCHAR(50) UNIQUE;

-- 3. Generate barcode unik untuk setiap variant yang sudah ada
UPDATE product_variants 
SET barcode = CONCAT('PROD', LPAD(product_id, 6, '0'), 'VAR', LPAD(variant_id, 4, '0'))
WHERE barcode IS NULL OR barcode = '';

-- 4. Tambah kolom SKU
ALTER TABLE product_variants 
ADD COLUMN sku VARCHAR(100) UNIQUE;

-- 5. Generate SKU otomatis
UPDATE product_variants 
SET sku = CONCAT('SKU', LPAD(product_id, 6, '0'), '-', UPPER(size), '-', LPAD(variant_id, 4, '0'))
WHERE sku IS NULL OR sku = '';

-- 6. Tambah kolom untuk tracking
ALTER TABLE product_variants 
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
ADD COLUMN is_active TINYINT(1) DEFAULT 1;

-- 7. Tambah index untuk optimasi
CREATE INDEX idx_product_variants_barcode ON product_variants(barcode);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);

-- 8. Hapus kolom barcode dari tabel products (setelah data dipindah)
-- UNCOMMENT BARIS DI BAWAH SETELAH MEMASTIKAN DATA SUDAH AMAN
-- ALTER TABLE products DROP COLUMN barcode;

-- =====================================================
-- FUNGSI UNTUK GENERATE BARCODE OTOMATIS
-- =====================================================

DELIMITER $$

CREATE FUNCTION generate_product_barcode(product_id INT, variant_id INT) 
RETURNS VARCHAR(50)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE barcode VARCHAR(50);
    SET barcode = CONCAT('PROD', LPAD(product_id, 6, '0'), 'VAR', LPAD(variant_id, 4, '0'));
    RETURN barcode;
END$$

DELIMITER ;

-- =====================================================
-- TRIGGER UNTUK AUTO-GENERATE BARCODE & SKU
-- =====================================================

DELIMITER $$

CREATE TRIGGER before_product_variant_insert 
BEFORE INSERT ON product_variants
FOR EACH ROW
BEGIN
    IF NEW.barcode IS NULL OR NEW.barcode = '' THEN
        SET NEW.barcode = generate_product_barcode(NEW.product_id, NEW.variant_id);
    END IF;
    
    IF NEW.sku IS NULL OR NEW.sku = '' THEN
        SET NEW.sku = CONCAT('SKU', LPAD(NEW.product_id, 6, '0'), '-', UPPER(NEW.size), '-', LPAD(NEW.variant_id, 4, '0'));
    END IF;
END$$

DELIMITER ;

-- =====================================================
-- VIEW UNTUK MEMUDAHKAN QUERY
-- =====================================================

CREATE VIEW product_with_variants AS
SELECT 
    p.product_id,
    p.product_name,
    p.description,
    p.price as base_price,
    p.category_id,
    p.is_active as product_active,
    pv.variant_id,
    pv.size,
    pv.barcode,
    pv.sku,
    pv.stock_quantity,
    pv.is_active as variant_active,
    pv.created_at,
    pv.updated_at
FROM products p
LEFT JOIN product_variants pv ON p.product_id = pv.product_id
WHERE p.is_active = 1 AND pv.is_active = 1;

-- =====================================================
-- CONTOH PENGGUNAAN
-- =====================================================

-- Insert produk baru
-- INSERT INTO products (product_name, description, price, category_id, is_active) 
-- VALUES ('Kaos Polos Premium', 'Kaos polos berkualitas tinggi', 150000.00, 1, 1);

-- Insert variants (barcode & SKU akan otomatis)
-- INSERT INTO product_variants (product_id, size, stock_quantity) VALUES
-- (1, 'S', 10),
-- (1, 'M', 15),
-- (1, 'L', 8),
-- (1, 'XL', 5);

-- Cari produk berdasarkan barcode
-- SELECT p.product_name, pv.size, pv.stock_quantity, p.price
-- FROM products p 
-- JOIN product_variants pv ON p.product_id = pv.product_id 
-- WHERE pv.barcode = 'PROD000001VAR0001';

-- =====================================================
-- CATATAN PENTING
-- =====================================================

/*
FORMAT BARCODE: PROD{product_id}VAR{variant_id}
FORMAT SKU: SKU{product_id}-{SIZE}-{variant_id}

CONTOH:
- Barcode: PROD000001VAR0001
- SKU: SKU000001-S-0001

KEUNTUNGAN:
1. Barcode unik per ukuran
2. SKU mudah dibaca
3. Stok terpisah per ukuran
4. Auto-generate barcode & SKU
5. Index untuk performa optimal
*/ 