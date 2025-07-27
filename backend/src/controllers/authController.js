const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../utils/emailService');
const db = require('../config/db');

const register = async (req, res) => {
  try {
    console.log('Register body:', req.body); // Debug log
    const { name, email, password, phone, address, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    const existing = await userModel.findByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'Email already registered.' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const userId = await userModel.createUser({ name, email, password: hashed, phone, address, role });
    res.status(201).json({ message: 'User registered', user_id: userId });
  } catch (err) {
    console.error('Register error:', err); // Debug log
    res.status(500).json({ message: 'Register failed', error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findByEmail(email);
    if (!user) {
      console.error('Login error: user not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.error('Login error: password mismatch');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ user_id: user.user_id, role: user.role }, process.env.JWT_SECRET || 'secret_anda', { expiresIn: '1d' });
    res.json({ token, user: { user_id: user.user_id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findByEmail(email);
    if (!user) {
      // Tidak mengirim error jika user tidak ditemukan untuk alasan keamanan
      return res.json({ message: 'Jika email terdaftar, link reset password akan dikirim.' });
    }

    const token = crypto.randomInt(100000, 999999).toString();
    const expires = Date.now() + 3600000; // 1 jam

    const [existing] = await db.query('SELECT * FROM password_resets WHERE email = ?', [email]);
    if (existing.length > 0) {
      await db.query('UPDATE password_resets SET token = ?, expires = ? WHERE email = ?', [token, expires, email]);
    } else {
      await db.query('INSERT INTO password_resets (email, token, expires) VALUES (?, ?, ?)', [email, token, expires]);
    }

    await sendPasswordResetEmail(email, token);

    res.json({ message: 'Link reset password telah dikirim ke email Anda.' });
  } catch (err) {
    console.error('Forgot Password error:', err);
    res.status(500).json({ message: 'Proses lupa password gagal', error: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, token, password } = req.body;
    
    const [savedToken] = await db.query('SELECT * FROM password_resets WHERE email = ? AND token = ?', [email, token]);

    if (savedToken.length === 0) {
      return res.status(400).json({ message: 'Token tidak valid atau email salah.' });
    }
    if (savedToken[0].expires < Date.now()) {
      return res.status(400).json({ message: 'Token sudah kedaluwarsa.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    await db.query('UPDATE users SET password = ? WHERE email = ?', [hashed, email]);
    await db.query('DELETE FROM password_resets WHERE email = ?', [email]);

    res.json({ message: 'Password berhasil direset. Silakan login kembali.' });
  } catch (err) {
    console.error('Reset Password error:', err);
    res.status(500).json({ message: 'Gagal mereset password', error: err.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { register, login, forgotPassword, resetPassword, getUserById }; 