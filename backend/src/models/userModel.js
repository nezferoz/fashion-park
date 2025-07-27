const db = require('../config/db');

const findByEmail = async (email) => {
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
};

const createUser = async (user) => {
  const {
    name, email, password, phone, address, role,
    province_id, province_name, city_id, city_name,
    district_id, district_name, postal_code, address_detail,
    latitude, longitude
  } = user;
  const [result] = await db.query(
    `INSERT INTO users (
      name, email, password, phone, address, role,
      province_id, province_name, city_id, city_name,
      district_id, district_name, postal_code, address_detail,
      latitude, longitude
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name, email, password, phone, address, role || 'pelanggan',
      province_id, province_name, city_id, city_name,
      district_id, district_name, postal_code, address_detail,
      latitude, longitude
    ]
  );
  return result.insertId;
};

const findById = async (user_id) => {
  const [rows] = await db.query('SELECT * FROM users WHERE user_id = ?', [user_id]);
  return rows[0];
};

const findAll = async () => {
  const [rows] = await db.query('SELECT * FROM users');
  return rows;
};

const update = async (user_id, data) => {
  const fields = [];
  const values = [];
  for (const key of [
    'name', 'email', 'phone', 'address', 'role', 'is_active',
    'province_id', 'province_name', 'city_id', 'city_name',
    'district_id', 'district_name', 'postal_code', 'address_detail',
    'latitude', 'longitude']) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    }
  }
  if (fields.length === 0) return null;
  values.push(user_id);
  await db.query(`UPDATE users SET ${fields.join(', ')} WHERE user_id = ?`, values);
  return findById(user_id);
};

const remove = async (user_id) => {
  const [result] = await db.query('DELETE FROM users WHERE user_id = ?', [user_id]);
  return result;
};

module.exports = {
  findByEmail,
  createUser,
  findById,
  findAll,
  update,
  remove,
}; 