-- Tabel untuk email verification
CREATE TABLE IF NOT EXISTS email_verifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    email VARCHAR(100) NOT NULL,
    token VARCHAR(255) NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    type ENUM('verification', 'reset_password') NOT NULL DEFAULT 'verification',
    expires_at DATETIME NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    used_at DATETIME NULL,
    FOREIGN KEY (user_id) REFERENCES users(userId) ON DELETE CASCADE
);

-- Tabel untuk password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    email VARCHAR(100) NOT NULL,
    token VARCHAR(255) NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    used_at DATETIME NULL,
    FOREIGN KEY (user_id) REFERENCES users(userId) ON DELETE CASCADE
);

-- Tambah kolom email_verified di tabel users
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN email_verified_at DATETIME NULL;

-- Index untuk optimasi query
CREATE INDEX idx_email_verifications_token ON email_verifications(token_hash);
CREATE INDEX idx_email_verifications_user_email ON email_verifications(user_id, email);
CREATE INDEX idx_email_verifications_expires ON email_verifications(expires_at);

CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token_hash);
CREATE INDEX idx_password_reset_tokens_user_email ON password_reset_tokens(user_id, email);
CREATE INDEX idx_password_reset_tokens_expires ON password_reset_tokens(expires_at);
