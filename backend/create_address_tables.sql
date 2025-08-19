-- Tabel untuk data alamat lengkap
-- Bukan hardcode, tapi data yang sebenarnya

-- Tabel Provinsi
CREATE TABLE IF NOT EXISTS provinces (
    province_id INT PRIMARY KEY,
    province_name VARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Kota/Kabupaten
CREATE TABLE IF NOT EXISTS cities (
    city_id INT PRIMARY KEY,
    city_name VARCHAR(100) NOT NULL,
    province_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (province_id) REFERENCES provinces(province_id)
);

-- Tabel Kecamatan
CREATE TABLE IF NOT EXISTS districts (
    district_id INT PRIMARY KEY,
    district_name VARCHAR(100) NOT NULL,
    city_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(city_id)
);

-- Tabel Desa/Kelurahan
CREATE TABLE IF NOT EXISTS villages (
    village_id INT PRIMARY KEY,
    village_name VARCHAR(100) NOT NULL,
    district_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (district_id) REFERENCES districts(district_id)
);

-- Tabel Kode Pos
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

-- Insert data provinsi (contoh beberapa)
INSERT INTO provinces (province_id, province_name) VALUES
(32, 'Sumatera Barat'),
(7, 'Jawa Barat'),
(8, 'Jawa Tengah'),
(1, 'Bali'),
(12, 'Kalimantan Barat')
ON DUPLICATE KEY UPDATE province_name = VALUES(province_name);

-- Insert data kota untuk Sumatera Barat
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
ON DUPLICATE KEY UPDATE city_name = VALUES(city_name);

-- Insert data kecamatan untuk Kota Padang
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
ON DUPLICATE KEY UPDATE district_name = VALUES(district_name);

-- Insert data desa untuk Kecamatan Kuranji
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
ON DUPLICATE KEY UPDATE village_name = VALUES(village_name);

-- Insert data kode pos untuk Kecamatan Kuranji
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
ON DUPLICATE KEY UPDATE postal_code = VALUES(postal_code);
