-- =====================================================
-- SUPABASE SEED: Initial Data
-- Fashion Park Inventory System
-- =====================================================

-- Insert sample categories
INSERT INTO categories (category_name, description) VALUES
('Pakaian Pria', 'Koleksi pakaian untuk pria'),
('Pakaian Wanita', 'Koleksi pakaian untuk wanita'),
('Aksesoris', 'Aksesoris fashion dan gaya'),
('Sepatu', 'Koleksi sepatu dan alas kaki')
ON CONFLICT (category_name) DO NOTHING;

-- Insert sample products
INSERT INTO products (product_name, description, price, category_id) VALUES
('Kaos Polos Premium', 'Kaos polos berkualitas tinggi dengan bahan premium', 150000.00, 1),
('Celana Jeans Slim Fit', 'Celana jeans dengan model slim fit yang nyaman', 250000.00, 1),
('Dress Casual', 'Dress casual yang elegan untuk berbagai acara', 300000.00, 2)
ON CONFLICT DO NOTHING;

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
(3, 'L', 6, 'PROD000003VAR0003')
ON CONFLICT DO NOTHING;

-- Insert sample provinces and cities
INSERT INTO provinces (province_id, province_name) VALUES
(32, 'Sumatera Barat'),
(7, 'Jawa Barat'),
(8, 'Jawa Tengah'),
(1, 'Bali'),
(12, 'Kalimantan Barat')
ON CONFLICT (province_id) DO NOTHING;

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
(457, 'Kabupaten Solok Selatan', 32)
ON CONFLICT (city_id) DO NOTHING;
