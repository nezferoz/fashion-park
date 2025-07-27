const db = require('../config/db');

const getAllCategories = async () => {
  const [rows] = await db.query('SELECT * FROM categories ORDER BY category_name');
  return rows;
};

const createCategory = async (category) => {
  const { category_name, description } = category;
  const [result] = await db.query(
    'INSERT INTO categories (category_name, description) VALUES (?, ?)',
    [category_name, description]
  );
  return result.insertId;
};

const updateCategory = async (id, category) => {
  const { category_name, description } = category;
  await db.query(
    'UPDATE categories SET category_name = ?, description = ? WHERE category_id = ?',
    [category_name, description, id]
  );
};

const deleteCategory = async (id) => {
  await db.query('DELETE FROM categories WHERE category_id = ?', [id]);
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
}; 