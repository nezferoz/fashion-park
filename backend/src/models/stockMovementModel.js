const db = require('../config/db');

const getMovementsByProductId = async (product_id) => {
  const [rows] = await db.query(
    `SELECT m.*, u.name as user_name FROM stock_movements m LEFT JOIN users u ON m.user_id = u.user_id WHERE m.product_id = ? ORDER BY m.movement_date DESC`,
    [product_id]
  );
  return rows;
};

const createMovement = async (movement) => {
  const { product_id, user_id, movement_type, quantity, notes } = movement;
  const [result] = await db.query(
    `INSERT INTO stock_movements (product_id, user_id, movement_type, quantity, notes) VALUES (?, ?, ?, ?, ?)`,
    [product_id, user_id, movement_type, quantity, notes]
  );
  return result.insertId;
};

const getAllMovements = async () => {
  const [rows] = await db.query(
    `SELECT m.*, u.name as user_name FROM stock_movements m LEFT JOIN users u ON m.user_id = u.user_id ORDER BY m.movement_date DESC`
  );
  return rows;
};

const deleteMovement = async (movement_id) => {
  await db.query('DELETE FROM stock_movements WHERE movement_id = ?', [movement_id]);
};

module.exports = {
  getMovementsByProductId,
  createMovement,
  getAllMovements,
  deleteMovement,
}; 