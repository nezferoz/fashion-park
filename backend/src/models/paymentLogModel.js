const db = require('../config/db');

const getLogsByTransactionId = async (transaction_id) => {
  const [rows] = await db.query(
    `SELECT * FROM payment_logs WHERE transaction_id = ? ORDER BY created_at DESC`,
    [transaction_id]
  );
  return rows;
};

const createLog = async (log) => {
  const { transaction_id, payment_gateway, gateway_response, status } = log;
  const [result] = await db.query(
    `INSERT INTO payment_logs (transaction_id, payment_gateway, gateway_response, status) VALUES (?, ?, ?, ?)`,
    [transaction_id, payment_gateway, gateway_response, status]
  );
  return result.insertId;
};

module.exports = {
  getLogsByTransactionId,
  createLog,
}; 