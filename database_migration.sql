-- =====================================================
-- MIGRATION SCRIPT: Ubah Struktur Database untuk Barcode per Ukuran
-- =====================================================

-- 1. Backup data existing (opsional tapi direkomendasikan)
-- CREATE TABLE products_backup AS SELECT * FROM products;
-- CREATE TABLE product_variants_backup AS SELECT * FROM product_variants;

-- 2. Tambah kolom barcode ke tabel product_variants (jika belum ada)
ALTER TABLE product_variants 
ADD COLUMN barcode VARCHAR(50) UNIQUE;

-- 3. Hapus kolom barcode dari tabel products (setelah data dipindah)
-- Catatan: Jalankan langkah 4 dulu sebelum menghapus kolom ini
-- ALTER TABLE products DROP COLUMN barcode;

-- 4. Generate barcode unik untuk setiap variant yang sudah ada
-- Script ini akan membuat barcode dengan format: PROD{product_id}VAR{variant_id}
UPDATE product_variants 
SET barcode = CONCAT('PROD', LPAD(product_id, 6, '0'), 'VAR', LPAD(variant_id, 4, '0'))
WHERE barcode IS NULL OR barcode = '';

-- 5. Tambah index untuk optimasi pencarian barcode
CREATE INDEX idx_product_variants_barcode ON product_variants(barcode);

-- 6. Tambah constraint untuk memastikan barcode tidak kosong
ALTER TABLE product_variants 
MODIFY COLUMN barcode VARCHAR(50) NOT NULL;

-- 7. Tambah kolom untuk tracking (opsional)
ALTER TABLE product_variants 
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 8. Tambah kolom untuk status aktif variant (opsional)
ALTER TABLE product_variants 
ADD COLUMN is_active TINYINT(1) DEFAULT 1;

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
-- TRIGGER UNTUK AUTO-GENERATE BARCODE
-- =====================================================

DELIMITER $$

CREATE TRIGGER before_product_variant_insert 
BEFORE INSERT ON product_variants
FOR EACH ROW
BEGIN
    IF NEW.barcode IS NULL OR NEW.barcode = '' THEN
        SET NEW.barcode = generate_product_barcode(NEW.product_id, NEW.variant_id);
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
    pv.stock_quantity,
    pv.is_active as variant_active,
    pv.created_at,
    pv.updated_at
FROM products p
LEFT JOIN product_variants pv ON p.product_id = pv.product_id
WHERE p.is_active = 1 AND pv.is_active = 1;

-- =====================================================
-- CONTOH QUERY UNTUK PENGGUNAAN
-- =====================================================

-- Query untuk mencari produk berdasarkan barcode
-- SELECT * FROM product_with_variants WHERE barcode = 'PROD000001VAR0001';

-- Query untuk melihat semua variant dengan barcode
-- SELECT product_name, size, barcode, stock_quantity 
-- FROM product_with_variants 
-- ORDER BY product_id, size;

-- Query untuk mencari stok berdasarkan barcode
-- SELECT p.product_name, pv.size, pv.stock_quantity 
-- FROM products p 
-- JOIN product_variants pv ON p.product_id = pv.product_id 
-- WHERE pv.barcode = 'PROD000001VAR0001';

-- =====================================================
-- CATATAN PENTING
-- =====================================================

/*
SETELAH MENJALANKAN SCRIPT INI:

1. Pastikan semua aplikasi yang menggunakan database sudah diupdate
2. Test semua fitur yang menggunakan barcode
3. Update kode aplikasi untuk menggunakan barcode dari tabel product_variants
4. Backup database secara berkala

FORMAT BARCODE YANG DIGENERATE:
- Format: PROD{product_id}VAR{variant_id}
- Contoh: PROD000001VAR0001, PROD000001VAR0002
- Panjang: 20 karakter
- Unik: Ya, karena kombinasi product_id + variant_id

ALTERNATIF FORMAT BARCODE:
Jika ingin format yang berbeda, bisa ubah fungsi generate_product_barcode:
- EAN-13: 13 digit
- UPC: 12 digit  
- Custom: Sesuai kebutuhan bisnis
*/ 