-- Script untuk menambahkan user admin, owner, dan kasir baru
-- Password: admin821 (tanpa hash)

-- User Admin baru
INSERT INTO users (name, email, password, phone, address, role, created_at, updated_at, is_active) 
VALUES (
    'Admin2', 
    'admin2@example.com', 
    'admin821',
    '081234567890',
    'Jl. Admin No. 2, Jakarta',
    'admin',
    NOW(),
    NOW(),
    1
);

-- User Owner/Pemilik baru
INSERT INTO users (name, email, password, phone, address, role, created_at, updated_at, is_active) 
VALUES (
    'Owner2', 
    'owner2@example.com', 
    'admin821',
    '081234567891',
    'Jl. Owner No. 2, Jakarta',
    'pemilik',
    NOW(),
    NOW(),
    1
);

-- User Kasir baru
INSERT INTO users (name, email, password, phone, address, role, created_at, updated_at, is_active) 
VALUES (
    'Kasir2', 
    'kasir2@example.com', 
    'admin821',
    '081234567892',
    'Jl. Kasir No. 2, Jakarta',
    'kasir',
    NOW(),
    NOW(),
    1
); 