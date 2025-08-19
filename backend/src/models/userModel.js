const db = require('../config/db');

const findByEmail = async (email) => {
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
};

const createUser = async (user) => {
  const {
    name, email, password, phone, address, role, email_verified = false
  } = user;
  const [result] = await db.query(
    `INSERT INTO users (
      name, email, password, phone, address, role, email_verified
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      name, email, password, phone, address, role || 'pelanggan', email_verified
    ]
  );
  return result.insertId;
};

const findById = async (user_id) => {
  console.log('findById called with user_id:', user_id);
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE userId = ?', [user_id]);
    console.log('Query result:', rows);
    return rows[0];
  } catch (error) {
    console.error('Error in findById:', error);
    throw error;
  }
};

const findAll = async () => {
  const [rows] = await db.query('SELECT * FROM users');
  return rows;
};

const findKasirPelanggan = async () => {
  const [rows] = await db.query('SELECT * FROM users WHERE role IN (?, ?) ORDER BY name', ['kasir', 'pelanggan']);
  return rows;
};

const findAdminOnly = async () => {
  const [rows] = await db.query('SELECT * FROM users WHERE role IN (?, ?) ORDER BY name', ['admin', 'owner']);
  return rows;
};

const update = async (user_id, data) => {
  const fields = [];
  const values = [];
  // Only update fields that exist in the database
  for (const key of [
    'name', 'email', 'phone', 'address', 'province_id', 'city_id', 'district_id', 'village_id', 'postal_code', 'role', 'isActive', 'email_verified', 'password'
  ]) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    }
  }
  if (fields.length === 0) return null;
  values.push(user_id);
  await db.query(`UPDATE users SET ${fields.join(', ')} WHERE userId = ?`, values);
  return findById(user_id);
};

const remove = async (user_id) => {
  const [result] = await db.query('DELETE FROM users WHERE userId = ?', [user_id]);
  return result;
};

const updateStatus = async (user_id, isActive) => {
  await db.query('UPDATE users SET isActive = ? WHERE userId = ?', [isActive, user_id]);
  return findById(user_id);
};

// Update email verification status
const updateEmailVerification = async (user_id, email_verified = true) => {
  await db.query(
    'UPDATE users SET email_verified = ?, email_verified_at = NOW() WHERE userId = ?',
    [email_verified, user_id]
  );
  return findById(user_id);
};

// Update password specifically
const updatePassword = async (user_id, hashedPassword) => {
  await db.query(
    'UPDATE users SET password = ? WHERE userId = ?',
    [hashedPassword, user_id]
  );
  return findById(user_id);
};

module.exports = {
  findByEmail,
  createUser,
  findById,
  findAll,
  findKasirPelanggan,
  findAdminOnly,
  update,
  remove,
  updateStatus,
  updateEmailVerification,
  updatePassword
}; 