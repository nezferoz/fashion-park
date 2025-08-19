-- =====================================================
-- SUPABASE MIGRATION: Sample Data and RLS Policies
-- Fashion Park Inventory System
-- =====================================================

-- ================= SAMPLE DATA =================
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

-- Insert sample districts for Kota Padang
INSERT INTO districts (district_id, district_name, city_id) VALUES
(6200, 'Kecamatan Kuranji', 440),
(6201, 'Kecamatan Padang Utara', 440),
(6202, 'Kecamatan Padang Barat', 440),
(6203, 'Kecamatan Padang Timur', 440),
(6204, 'Kecamatan Padang Selatan', 440),
(6205, 'Kecamatan Lubuk Begalung', 440),
(6206, 'Kecamatan Lubuk Kilangan', 440),
(6207, 'Kecamatan Nanggalo', 440),
(6208, 'Kecamatan Pauh', 440),
(6209, 'Kecamatan Koto Tangah', 440)
ON CONFLICT (district_id) DO NOTHING;

-- Insert sample villages for Kecamatan Kuranji
INSERT INTO villages (village_id, village_name, district_id) VALUES
(9000, 'Kelurahan Ampang', 6200),
(9001, 'Kelurahan Kuranji', 6200),
(9002, 'Kelurahan Anduring', 6200),
(9003, 'Kelurahan Sungai Sapih', 6200),
(9004, 'Kelurahan Korong Gadang', 6200),
(9005, 'Kelurahan Pasar Ambacang', 6200),
(9006, 'Kelurahan Kalumbuk', 6200),
(9007, 'Kelurahan Gurun Laweh', 6200),
(9008, 'Kelurahan Lambung Bukit', 6200),
(9009, 'Kelurahan Cangkeh', 6200),
(9010, 'Kelurahan Parak Laweh', 6200),
(9011, 'Kelurahan Parak Gadang', 6200),
(9012, 'Kelurahan Parak Karakah', 6200)
ON CONFLICT (village_id) DO NOTHING;

-- Insert sample postal codes for Kecamatan Kuranji
INSERT INTO postal_codes (postal_code, village_id, district_id, city_id) VALUES
('25154', 9000, 6200, 440),
('25155', 9001, 6200, 440),
('25156', 9002, 6200, 440),
('25157', 9003, 6200, 440),
('25158', 9004, 6200, 440),
('25159', 9005, 6200, 440),
('25160', 9006, 6200, 440),
('25161', 9007, 6200, 440),
('25162', 9008, 6200, 440),
('25163', 9009, 6200, 440),
('25164', 9010, 6200, 440),
('25165', 9011, 6200, 440),
('25166', 9012, 6200, 440)
ON CONFLICT DO NOTHING;

-- ================= ROW LEVEL SECURITY (RLS) =================
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ================= RLS POLICIES =================
-- Users table policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Categories table policies (public read access)
CREATE POLICY "Public can view categories" ON categories
    FOR SELECT USING (true);

-- Products table policies
CREATE POLICY "Public can view active products" ON products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage all products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = auth.uid()::integer 
            AND role IN ('admin', 'pemilik')
        )
    );

-- Product variants table policies
CREATE POLICY "Public can view active product variants" ON product_variants
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage all product variants" ON product_variants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = auth.uid()::integer 
            AND role IN ('admin', 'pemilik')
        )
    );

-- Transactions table policies
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Cashiers can view all transactions" ON transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = auth.uid()::integer 
            AND role IN ('admin', 'kasir', 'pemilik')
        )
    );

CREATE POLICY "Cashiers can insert transactions" ON transactions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = auth.uid()::integer 
            AND role IN ('admin', 'kasir', 'pemilik')
        )
    );

CREATE POLICY "Cashiers can update transactions" ON transactions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = auth.uid()::integer 
            AND role IN ('admin', 'kasir', 'pemilik')
        )
    );

-- Transaction details table policies
CREATE POLICY "Users can view own transaction details" ON transaction_details
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM transactions t
            WHERE t.transaction_id = transaction_details.transaction_id
            AND t.user_id = auth.uid()::integer
        )
    );

CREATE POLICY "Cashiers can view all transaction details" ON transaction_details
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = auth.uid()::integer 
            AND role IN ('admin', 'kasir', 'pemilik')
        )
    );

CREATE POLICY "Cashiers can insert transaction details" ON transaction_details
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = auth.uid()::integer 
            AND role IN ('admin', 'kasir', 'pemilik')
        )
    );

-- Cart table policies
CREATE POLICY "Users can view own cart" ON cart
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert into own cart" ON cart
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own cart" ON cart
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete from own cart" ON cart
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Stock movements table policies
CREATE POLICY "Admin can view all stock movements" ON stock_movements
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = auth.uid()::integer 
            AND role IN ('admin', 'pemilik')
        )
    );

CREATE POLICY "Admin can insert stock movements" ON stock_movements
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = auth.uid()::integer 
            AND role IN ('admin', 'pemilik')
        )
    );

CREATE POLICY "Admin can update stock movements" ON stock_movements
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = auth.uid()::integer 
            AND role IN ('admin', 'pemilik')
        )
    );

-- Refunds table policies
CREATE POLICY "Users can view own refunds" ON refunds
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM transactions t
            WHERE t.transaction_id = refunds.transaction_id
            AND t.user_id = auth.uid()::integer
        )
    );

CREATE POLICY "Admin can view all refunds" ON refunds
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = auth.uid()::integer 
            AND role IN ('admin', 'pemilik')
        )
    );

CREATE POLICY "Users can insert refunds for own transactions" ON refunds
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM transactions t
            WHERE t.transaction_id = refunds.transaction_id
            AND t.user_id = auth.uid()::integer
        )
    );

CREATE POLICY "Admin can update refunds" ON refunds
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = auth.uid()::integer 
            AND role IN ('admin', 'pemilik')
        )
    );

-- Notifications table policies
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Address tables policies (public read access)
CREATE POLICY "Public can view provinces" ON provinces
    FOR SELECT USING (true);

CREATE POLICY "Public can view cities" ON cities
    FOR SELECT USING (true);

CREATE POLICY "Public can view districts" ON districts
    FOR SELECT USING (true);

CREATE POLICY "Public can view villages" ON villages
    FOR SELECT USING (true);

CREATE POLICY "Public can view postal codes" ON postal_codes
    FOR SELECT USING (true);

-- ================= COMMENTS =================
COMMENT ON TABLE users IS 'Tabel untuk menyimpan data pengguna sistem';
COMMENT ON TABLE categories IS 'Tabel untuk kategori produk';
COMMENT ON TABLE products IS 'Tabel untuk produk utama';
COMMENT ON TABLE product_variants IS 'Tabel untuk varian produk (ukuran, stok)';
COMMENT ON TABLE transactions IS 'Tabel untuk transaksi penjualan';
COMMENT ON TABLE transaction_details IS 'Tabel detail item dalam transaksi';
COMMENT ON TABLE cart IS 'Tabel keranjang belanja pengguna';
COMMENT ON TABLE stock_movements IS 'Tabel untuk tracking pergerakan stok';
COMMENT ON TABLE refunds IS 'Tabel untuk pengembalian dana';
COMMENT ON TABLE notifications IS 'Tabel untuk notifikasi pengguna';
COMMENT ON TABLE provinces IS 'Tabel data provinsi Indonesia';
COMMENT ON TABLE cities IS 'Tabel data kota/kabupaten Indonesia';
COMMENT ON TABLE districts IS 'Tabel data kecamatan Indonesia';
COMMENT ON TABLE villages IS 'Tabel data desa/kelurahan Indonesia';
COMMENT ON TABLE postal_codes IS 'Tabel data kode pos Indonesia';
