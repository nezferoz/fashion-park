const db = require('../config/db');

const getApiKey = async (service = 'rajaongkir') => {
  const [rows] = await db.query(
    `SELECT api_key, service_name, is_active, created_at, updated_at 
     FROM api_keys 
     WHERE service_name = ? AND is_active = 1`,
    [service]
  );
  return rows[0];
};

const createApiKey = async (serviceName, apiKey) => {
  // Deactivate existing keys for this service
  await db.query(
    `UPDATE api_keys SET is_active = 0 WHERE service_name = ?`,
    [serviceName]
  );
  
  // Insert new API key
  const [result] = await db.query(
    `INSERT INTO api_keys (service_name, api_key, is_active) 
     VALUES (?, ?, 1)`,
    [serviceName, apiKey]
  );
  
  return result.insertId;
};

const updateApiKey = async (id, apiKey) => {
  await db.query(
    `UPDATE api_keys SET api_key = ?, updated_at = NOW() WHERE id = ?`,
    [apiKey, id]
  );
};

const deactivateApiKey = async (id) => {
  await db.query(
    `UPDATE api_keys SET is_active = 0 WHERE id = ?`,
    [id]
  );
};

const getAllApiKeys = async () => {
  const [rows] = await db.query(
    `SELECT id, service_name, api_key, is_active, created_at, updated_at 
     FROM api_keys 
     ORDER BY service_name, created_at DESC`
  );
  return rows;
};

module.exports = {
  getApiKey,
  createApiKey,
  updateApiKey,
  deactivateApiKey,
  getAllApiKeys
}; 