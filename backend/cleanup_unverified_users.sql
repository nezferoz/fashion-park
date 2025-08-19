-- Hapus user yang belum diverifikasi
DELETE FROM users WHERE email_verified = 0;

-- Hapus token verifikasi yang sudah tidak valid
DELETE FROM email_verifications WHERE expires_at < NOW();

-- Reset auto increment
ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE email_verifications AUTO_INCREMENT = 1;
