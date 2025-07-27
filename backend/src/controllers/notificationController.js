const notificationModel = require('../models/notificationModel');

const getByUserId = async (req, res) => {
  try {
    const user_id = req.query.user_id;
    if (!user_id) return res.status(400).json({ message: 'user_id wajib diisi' });
    const notifs = await notificationModel.getByUserId(user_id);
    res.json(notifs);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil notifikasi', error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { user_id, message, type } = req.body;
    if (!user_id || !message) return res.status(400).json({ message: 'user_id dan message wajib diisi' });
    const id = await notificationModel.create({ user_id, message, type });
    res.status(201).json({ message: 'Notifikasi ditambahkan', notification_id: id });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menambah notifikasi', error: err.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await notificationModel.markAsRead(id);
    res.json({ message: 'Notifikasi ditandai sudah dibaca' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal update notifikasi', error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    await notificationModel.remove(id);
    res.json({ message: 'Notifikasi dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal hapus notifikasi', error: err.message });
  }
};

module.exports = { getByUserId, create, markAsRead, remove }; 