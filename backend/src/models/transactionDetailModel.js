const db = require('../config/db');

const getDetailsByTransactionId = async (transaction_id) => {
  const [rows] = await db.query(
    `SELECT d.*, p.product_name FROM transaction_details d LEFT JOIN products p ON d.product_id = p.product_id WHERE d.transaction_id = ?`,
    [transaction_id]
  );
  return rows;
};

const createDetails = async (transaction_id, details) => {
  for (const item of details) {
    const { product_id, quantity, unit_price, subtotal } = item;
    await db.query(
      `INSERT INTO transaction_details (transaction_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)`,
      [transaction_id, product_id, quantity, unit_price, subtotal]
    );
  }
};

module.exports = {
  getDetailsByTransactionId,
  createDetails,
}; 