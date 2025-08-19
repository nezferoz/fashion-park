const userModel = require('../models/userModel');
const db = require('../db'); // Added db import

const getAllUsers = async (req, res) => {
  try {
    // Hanya admin yang bisa akses semua user (owner tidak bisa)
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Only admin can access all users' });
    }
    
    const users = await userModel.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getUserById = async (req, res) => {
  try {
    console.log('getUserById called with params:', req.params);
    console.log('User ID from params:', req.params.id);
    console.log('User from request:', req.user);
    
    const user = await userModel.findById(req.params.id);
    console.log('User found:', user);
    
    if (!user) {
      console.log('User not found for ID:', req.params.id);
      return res.status(404).json({ message: 'User not found' });
    }
    // Jika bukan owner/admin, hanya boleh akses dirinya sendiri
    const role = req.user.role?.toLowerCase();
    const currentUserId = req.user.user_id || req.user.userId;
    console.log('User role:', role, 'Requested user ID:', req.params.id, 'Current user ID:', currentUserId);
    
    if (role !== 'owner' && role !== 'admin' && currentUserId != req.params.id) {
      console.log('Access denied: user trying to access different user profile');
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error in getUserById:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const targetUser = await userModel.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Authorization logic
    const role = req.user.role?.toLowerCase();
    const currentUserId = req.user.user_id;
    const targetUserId = parseInt(req.params.id);
    
    // User hanya boleh update profilnya sendiri, kecuali admin/owner
    if (role !== 'owner' && role !== 'admin' && currentUserId !== targetUserId) {
      return res.status(403).json({ message: 'Forbidden: you can only update your own profile' });
    }
    
    // Hanya owner yang boleh update user dengan role owner
    if (targetUser.role?.toLowerCase() === 'owner' && role !== 'owner') {
      return res.status(403).json({ message: 'Forbidden: only owner can update owner' });
    }
    
    // Handle password update with validation
    if (req.body.new_password) {
      // Check if current password is provided
      if (!req.body.current_password) {
        return res.status(400).json({ message: 'Password saat ini diperlukan untuk mengubah password' });
      }
      
      // Verify current password
      const bcrypt = require('bcrypt');
      const isValidPassword = await bcrypt.compare(req.body.current_password, targetUser.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Password saat ini salah' });
      }
      
      // Hash new password
      const hashedNewPassword = await bcrypt.hash(req.body.new_password, 10);
      
      // Update password separately
      await userModel.updatePassword(req.params.id, hashedNewPassword);
      
      // Remove password fields from req.body for profile update
      delete req.body.current_password;
      delete req.body.new_password;
      delete req.body.confirm_password;
    }
    
    // Update other profile data if any
    if (Object.keys(req.body).length > 0) {
      await userModel.update(req.params.id, req.body);
    }
    
    const updatedUser = await userModel.findById(req.params.id);
    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const result = await userModel.remove(req.params.id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getUserCount = async (req, res) => {
  try {
    console.log('getUserCount called');
    const [rows] = await db.query('SELECT COUNT(*) as count FROM users WHERE role IN (?, ?)', ['kasir', 'pelanggan']);
    console.log('User count result (kasir + pelanggan):', rows[0]);
    res.json({ count: rows[0].count });
  } catch (err) {
    console.error('GET USER COUNT ERROR:', err);
    res.status(500).json({ message: 'Gagal mengambil jumlah user', error: err.message });
  }
};

const getProfile = async (req, res) => {
  try {
    // Handle both old and new JWT token formats
    const userId = req.user.user_id || req.user.userId;
    console.log('getProfile called with userId:', userId);
    console.log('Full user object from JWT:', req.user);
    
    if (!userId) {
      console.log('❌ User ID is null/undefined in JWT token');
      console.log('Available fields:', Object.keys(req.user));
      return res.status(400).json({ message: 'User ID tidak ditemukan dalam token' });
    }
    
    const user = await userModel.findById(userId);
    
    if (!user) {
      console.log('User not found for ID:', userId);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('User found:', user);
    res.json(user);
  } catch (err) {
    console.error('Error in getProfile:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getKasirPelangganUsers = async (req, res) => {
  try {
    const users = await userModel.findKasirPelanggan();
    res.json(users);
  } catch (err) {
    console.error('Error getting kasir/pelanggan users:', err);
    res.status(500).json({ message: 'Gagal mengambil data user', error: err.message });
  }
};

const getAdminOnlyUsers = async (req, res) => {
  try {
    // Only owner can access this endpoint
    if (req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Forbidden: Only owner can access admin users' });
    }
    
    const users = await userModel.findAdminOnly();
    res.json(users);
  } catch (err) {
    console.error('Error getting admin users:', err);
    res.status(500).json({ message: 'Gagal mengambil data admin', error: err.message });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const targetUser = await userModel.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Authorization logic - hanya admin yang bisa toggle status
    const role = req.user.role?.toLowerCase();
    
    if (role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Only admin can toggle user status' });
    }
    
    // Owner tidak bisa dinonaktifkan
    if (targetUser.role?.toLowerCase() === 'owner') {
      return res.status(403).json({ message: 'Forbidden: Cannot deactivate owner account' });
    }
    
    const newStatus = !targetUser.isActive;
    const updatedUser = await userModel.updateStatus(req.params.id, newStatus);
    res.json({ 
      message: `User ${newStatus ? 'activated' : 'deactivated'} successfully`, 
      user: updatedUser 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const createUser = async (req, res) => {
  try {
    // Hanya admin yang bisa create user
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Only admin can create users' });
    }
    
    // Admin tidak bisa membuat user dengan role owner
    if (req.body.role === 'owner') {
      return res.status(403).json({ message: 'Forbidden: Admin cannot create owner users' });
    }
    
    const userId = await userModel.createUser(req.body);
    const newUser = await userModel.findById(userId);
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserCount,
  getProfile,
  getKasirPelangganUsers,
  getAdminOnlyUsers,
  toggleUserStatus,
  createUser
}; 