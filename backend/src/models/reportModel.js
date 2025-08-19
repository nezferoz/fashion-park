const db = require('../config/db');

const getAllReports = async (type) => {
  const [rows] = await db.query(
    `SELECT r.*, u.name as user_name FROM reports r LEFT JOIN users u ON r.user_id = u.userId WHERE r.report_type = ? ORDER BY r.report_date DESC`,
    [type]
  );
  return rows;
};

const createReport = async (report) => {
  const { user_id, report_type, report_date, total_sales, total_transactions, report_data } = report;
  const [result] = await db.query(
    `INSERT INTO reports (user_id, report_type, report_date, total_sales, total_transactions, report_data) VALUES (?, ?, ?, ?, ?, ?)`,
    [user_id, report_type, report_date, total_sales, total_transactions, report_data]
  );
  return result.insertId;
};

module.exports = {
  getAllReports,
  createReport,
}; 