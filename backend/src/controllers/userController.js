const userModel = require('../models/userModel');

const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getUserById = async (req, res) => {
  console.log('DEBUG getUserById:', { user: req.user, paramId: req.params.id });
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Jika bukan owner/admin, hanya boleh akses dirinya sendiri
    if (req.user.role !== 'owner' && req.user.role !== 'admin' && req.user.user_id != req.params.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const targetUser = await userModel.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Hanya owner yang boleh update user dengan role owner
    if (targetUser.role === 'owner' && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Forbidden: only owner can update owner' });
    }
    const updatedUser = await userModel.update(req.params.id, req.body);
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

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
}; 