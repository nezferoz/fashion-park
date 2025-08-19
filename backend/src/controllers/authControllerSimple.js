const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const crypto = require('crypto');
const db = require('../config/db');
// EmailJS dihandle di frontend, tidak perlu import email service

// Register tanpa email verification
const register = async (req, res) => {
  try {
    const { name, email, password, email_verified = false } = req.body;

    // Validasi input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nama, email, dan password diperlukan'
      });
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email sudah terdaftar'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user baru
    const userData = {
      name,
      email,
      password: hashedPassword,
      role: 'pelanggan',
      email_verified: email_verified, // Berdasarkan parameter dari frontend
      email_verified_at: email_verified ? new Date() : null
    };

    const userId = await userModel.createUser(userData);
    const newUser = await userModel.findById(userId);

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.userId, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil!',
      token,
      user: {
        userId: newUser.userId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password diperlukan'
      });
    }

    // Cari user berdasarkan email
    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
    }

    // Cek apakah user aktif
    if (user.isActive === 0) {
      return res.status(401).json({
        success: false,
        message: 'Akun Anda telah dinonaktifkan'
      });
    }

    // Cek apakah email sudah diverifikasi (hanya untuk user baru yang registrasi via OTP)
    // User yang sudah ada di database (sebelum sistem OTP) bisa langsung login
    if (user.email_verified === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email belum diverifikasi. Silakan verifikasi email Anda terlebih dahulu.',
        needsVerification: true
      });
    }

    // Verifikasi password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { user_id: user.userId, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login berhasil',
      token,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.user_id;

    // Validasi input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password lama dan baru diperlukan'
      });
    }

    // Ambil user
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    // Verifikasi password lama
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Password lama salah'
      });
    }

    // Hash password baru
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await userModel.updatePassword(userId, hashedNewPassword);

    res.json({
      success: true,
      message: 'Password berhasil diubah'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

// Request password reset
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email diperlukan'
      });
    }

    // Find user by email
    const user = await userModel.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message: 'Jika email terdaftar, link reset password akan dikirim.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Save reset token to database
    await db.query(
      'INSERT INTO password_reset_tokens (user_id, email, token, token_hash, expires_at) VALUES (?, ?, ?, ?, ?)',
      [user.userId, email, resetToken, tokenHash, expiresAt]
    );

    // EmailJS dihandle di frontend
    console.log(`Password reset token generated for ${email}: ${resetToken}`);
    
    res.json({
      success: true,
      message: 'Instruksi reset password telah dikirim ke email Anda.'
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

// Reset password dengan token
const resetPassword = async (req, res) => {
  try {
    const { token, new_password } = req.body;

    if (!token || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Token dan password baru diperlukan'
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password minimal 6 karakter'
      });
    }

    // Hash the token to compare with database
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find reset token
    const [tokens] = await db.query(
      'SELECT * FROM password_reset_tokens WHERE token_hash = ? AND is_used = FALSE AND expires_at > NOW()',
      [tokenHash]
    );

    if (tokens.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Token reset password tidak valid atau sudah kadaluarsa'
      });
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

    res.json({
      success: true,
      message: 'Password berhasil direset! Silakan login dengan password baru.'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

// Generate reset token only (untuk EmailJS)
const generateResetToken = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email diperlukan'
      });
    }

    // Find user by email
    const user = await userModel.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message: 'Jika email terdaftar, Anda akan menerima instruksi reset password.',
        token: null // No token for non-existent users
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Save reset token to database
    await db.query(
      'INSERT INTO password_reset_tokens (user_id, email, token, token_hash, expires_at) VALUES (?, ?, ?, ?, ?)',
      [user.userId, email, resetToken, tokenHash, expiresAt]
    );

    console.log(`📧 RESET TOKEN GENERATED for ${email}: ${resetToken}`);
    
    res.json({
      success: true,
      message: 'Token reset password berhasil dibuat.',
      token: resetToken,
      username: user.name,
      email: email
    });

  } catch (error) {
    console.error('Generate reset token error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

module.exports = {
  register,
  login,
  changePassword,
  requestPasswordReset,
  resetPassword,
  generateResetToken
};
