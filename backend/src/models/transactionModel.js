const db = require('../config/db');

const getAllTransactions = async () => {
  const [rows] = await db.query(
    `SELECT t.*, u.name as customer_name, c.name as cashier_name FROM transactions t
     LEFT JOIN users u ON t.user_id = u.user_id
     LEFT JOIN users c ON t.cashier_id = c.user_id
     ORDER BY t.transaction_date DESC`
  );
  return rows;
};

const getTransactionById = async (id) => {
  const [rows] = await db.query(
    `SELECT t.*, u.name as customer_name, c.name as cashier_name FROM transactions t
     LEFT JOIN users u ON t.user_id = u.user_id
     LEFT JOIN users c ON t.cashier_id = c.user_id
     WHERE t.transaction_id = ?`,
    [id]
  );
  return rows[0];
};

const createTransaction = async (trx) => {
  const {
    transaction_code, user_id, cashier_id, total_amount, discount, final_amount,
    payment_method, payment_status, payment_reference
  } = trx;
  const [result] = await db.query(
    `INSERT INTO transactions (transaction_code, user_id, cashier_id, total_amount, discount, final_amount, payment_method, payment_status, payment_reference)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [transaction_code, user_id, cashier_id, total_amount, discount, final_amount, payment_method, payment_status, payment_reference]
  );
  return result.insertId;
};

const updateMidtransFeeAndStatus = async (order_id, fee, status) => {
  await db.query(
    `UPDATE transactions SET midtrans_fee = ?, midtrans_status = ? WHERE transaction_code = ?`,
    [fee, status, order_id]
  );
};

const getByOrderId = async (order_id) => {
  const [rows] = await db.query(
    `SELECT * FROM transactions WHERE transaction_code = ?`,
    [order_id]
  );
  return rows[0];
};

const getAllTransactionsByUserId = async (user_id) => {
  const [rows] = await db.query(
    `SELECT t.*, u.name as customer_name, c.name as cashier_name FROM transactions t
     LEFT JOIN users u ON t.user_id = u.user_id
     LEFT JOIN users c ON t.cashier_id = c.user_id
     WHERE t.user_id = ?
     ORDER BY t.transaction_date DESC`,
    [user_id]
  );
  return rows;
};

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateMidtransFeeAndStatus,
  getByOrderId,
  getAllTransactionsByUserId,
}; 