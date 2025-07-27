const db = require('../config/db');

const getByUserId = async (user_id) => {
  const [rows] = await db.query('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC', [user_id]);
  return rows;
};

const create = async ({ user_id, message, type }) => {
  const [result] = await db.query('INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)', [user_id, message, type || 'info']);
  return result.insertId;
};

const markAsRead = async (notification_id) => {
  await db.query('UPDATE notifications SET is_read = 1 WHERE notification_id = ?', [notification_id]);
};

const remove = async (notification_id) => {
  await db.query('DELETE FROM notifications WHERE notification_id = ?', [notification_id]);
};

module.exports = { getByUserId, create, markAsRead, remove }; 