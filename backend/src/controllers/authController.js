const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
// EmailJS dihandle di frontend, tidak perlu import email service
const tokenService = require('../services/tokenService');
const db = require('../config/db');
const crypto = require('crypto');

// Register dengan email verification
const register = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Check if user already exists
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (belum verified)
    const userData = {
      name, 
      email, 
      password: hashedPassword,
      phone, 
      address, 
      role: 'pelanggan',
      email_verified: false
    };

    const userId = await userModel.createUser(userData);

    // Generate verification token
    const verificationToken = tokenService.generateVerificationToken();
    const tokenHash = tokenService.hashToken(verificationToken);
    const expiresAt = tokenService.generateExpirationTime('verification');

    // Save verification token to database
    await db.query(
      'INSERT INTO email_verifications (user_id, email, token, token_hash, type, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, email, verificationToken, tokenHash, 'verification', expiresAt]
    );

    // EmailJS dihandle di frontend
    
    res.status(201).json({ 
      message: 'Registrasi berhasil! Silakan cek email Anda untuk verifikasi.',
      userId,
      email,
      verificationToken: verificationToken
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Gagal melakukan registrasi', error: error.message });
  }
};

// Login dengan email verification check
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    // Check if email is verified
    if (!user.email_verified) {
      return res.status(401).json({ 
        message: 'Email belum diverifikasi. Silakan cek email Anda atau request verifikasi ulang.',
        needsVerification: true,
        email: user.email
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Akun Anda telah dinonaktifkan. Hubungi admin.' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        user_id: user.userId, 
        email: user.email, 
        role: user.role,
        email_verified: user.email_verified
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login berhasil',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Gagal melakukan login', error: error.message });
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: 'Token verifikasi diperlukan' });
    }

    // Find verification record
    const [verifications] = await db.query(
      'SELECT * FROM email_verifications WHERE token_hash = ? AND type = "verification" AND is_used = FALSE AND expires_at > NOW()',
      [tokenService.hashToken(token)]
    );

    if (verifications.length === 0) {
      return res.status(400).json({ message: 'Token verifikasi tidak valid atau sudah kadaluarsa' });
    }

    const verification = verifications[0];

    // Mark verification as used
    await db.query(
      'UPDATE email_verifications SET is_used = TRUE, used_at = NOW() WHERE id = ?',
      [verification.id]
    );

    // Update user as verified
    await db.query(
      'UPDATE users SET email_verified = TRUE, email_verified_at = NOW() WHERE userId = ?',
      [verification.user_id]
    );

    res.json({ message: 'Email berhasil diverifikasi! Silakan login.' });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Gagal memverifikasi email', error: error.message });
  }
};

// Request password reset
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email diperlukan' });
    }

    // Find user by email
    const user = await userModel.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not
      return res.json({ message: 'Jika email terdaftar, link reset password akan dikirim.' });
    }

    // Generate reset token
    const resetToken = tokenService.generateResetToken();
    const tokenHash = tokenService.hashToken(resetToken);
    const expiresAt = tokenService.generateExpirationTime('reset');

    // Save reset token to database
    await db.query(
      'INSERT INTO password_reset_tokens (user_id, email, token, token_hash, expires_at) VALUES (?, ?, ?, ?, ?)',
      [user.userId, email, resetToken, tokenHash, expiresAt]
    );

    // EmailJS dihandle di frontend
    
    res.json({ 
      message: 'Reset token berhasil dibuat', 
      resetToken: resetToken 
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ message: 'Gagal mengirim link reset password', error: error.message });
  }
};

// Reset password dengan token
const resetPassword = async (req, res) => {
  try {
    const { token, new_password } = req.body;

    if (!token || !new_password) {
      return res.status(400).json({ message: 'Token dan password baru diperlukan' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ message: 'Password minimal 6 karakter' });
    }

    // Find reset token
    const [tokens] = await db.query(
      'SELECT * FROM password_reset_tokens WHERE token_hash = ? AND is_used = FALSE AND expires_at > NOW()',
      [tokenService.hashToken(token)]
    );

    if (tokens.length === 0) {
      return res.status(400).json({ message: 'Token reset password tidak valid atau sudah kadaluarsa' });
    }

    const resetToken = tokens[0];

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update user password
    await db.query(
      'UPDATE users SET password = ? WHERE userId = ?',
      [hashedPassword, resetToken.user_id]
    );

    // Mark token as used
    await db.query(
      'UPDATE password_reset_tokens SET is_used = TRUE, used_at = NOW() WHERE id = ?',
      [resetToken.id]
    );

    // EmailJS dihandle di frontend

    res.json({ message: 'Password berhasil direset! Silakan login dengan password baru.' });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Gagal mereset password', error: error.message });
  }
};

// Check email verification status
const checkVerificationStatus = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email diperlukan' 
      });
    }

    const user = await userModel.findByEmail(email);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User tidak ditemukan' 
      });
    }

    res.json({
      success: true,
      verified: user.email_verified === 1,
      email: user.email
    });
  } catch (error) {
    console.error('Error checking verification status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    });
  }
};

// Resend verification email
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email diperlukan' 
      });
    }

    const user = await userModel.findByEmail(email);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User tidak ditemukan' 
      });
    }

    if (user.email_verified === 1) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email sudah diverifikasi' 
      });
    }

    // Generate new verification token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    // Save to database
    await db.query(
      'INSERT INTO email_verifications (user_id, email, token, token_hash, type, expires_at) VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))',
      [user.userId, email, token, tokenHash, 'verification']
    );

    // EmailJS dihandle di frontend
    
    res.json({
      success: true,
      message: 'Email verifikasi telah dikirim ulang',
      verificationToken: token
    });
  } catch (error) {
    console.error('Error resending verification:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal mengirim email verifikasi' 
    });
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  checkVerificationStatus,
  resendVerification
}; 