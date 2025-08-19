const apiKeyModel = require('../models/apiKeyModel');

const getApiKeys = async (req, res) => {
  try {
    const apiKeys = await apiKeyModel.getAllApiKeys();
    res.json(apiKeys);
  } catch (err) {
    console.error('API KEY ERROR:', err);
    res.status(500).json({ message: 'Gagal mengambil data API keys', error: err.message });
  }
};

const getApiKey = async (req, res) => {
  try {
    const { service } = req.params;
    const apiKey = await apiKeyModel.getApiKey(service);
    
    if (!apiKey) {
      return res.status(404).json({ message: 'API key tidak ditemukan' });
    }
    
    // Mask the API key for security
    const maskedApiKey = apiKey.api_key.substring(0, 8) + '...' + apiKey.api_key.substring(apiKey.api_key.length - 4);
    
    res.json({
      ...apiKey,
      api_key: maskedApiKey,
      masked: true
    });
  } catch (err) {
    console.error('API KEY ERROR:', err);
    res.status(500).json({ message: 'Gagal mengambil data API key', error: err.message });
  }
};

const createApiKey = async (req, res) => {
  try {
    const { service_name, api_key } = req.body;
    
    if (!service_name || !api_key) {
      return res.status(400).json({ message: 'Service name dan API key harus diisi' });
    }
    
    const id = await apiKeyModel.createApiKey(service_name, api_key);
    res.status(201).json({ 
      message: 'API key berhasil ditambahkan', 
      id: id,
      service_name: service_name 
    });
  } catch (err) {
    console.error('API KEY ERROR:', err);
    res.status(500).json({ message: 'Gagal menambah API key', error: err.message });
  }
};

const updateApiKey = async (req, res) => {
  try {
    const { id } = req.params;
    const { api_key } = req.body;
    
    if (!api_key) {
      return res.status(400).json({ message: 'API key harus diisi' });
    }
    
    await apiKeyModel.updateApiKey(id, api_key);
    res.json({ message: 'API key berhasil diperbarui' });
  } catch (err) {
    console.error('API KEY ERROR:', err);
    res.status(500).json({ message: 'Gagal memperbarui API key', error: err.message });
  }
};

const deactivateApiKey = async (req, res) => {
  try {
    const { id } = req.params;
    await apiKeyModel.deactivateApiKey(id);
    res.json({ message: 'API key berhasil dinonaktifkan' });
  } catch (err) {
    console.error('API KEY ERROR:', err);
    res.status(500).json({ message: 'Gagal menonaktifkan API key', error: err.message });
  }
};

const testRajaOngkirApi = async (req, res) => {
  try {
    const apiKeyData = await apiKeyModel.getApiKey('rajaongkir');
    
    if (!apiKeyData) {
      return res.status(404).json({ message: 'API key RajaOngkir tidak ditemukan' });
    }
    
    // Test RajaOngkir API
    const axios = require('axios');
    const response = await axios.get('https://api.rajaongkir.com/starter/province', {
      headers: {
        'key': apiKeyData.api_key
      }
    });
    
    res.json({ 
      message: 'API RajaOngkir berfungsi dengan baik',
      test_result: response.data
    });
  } catch (err) {
    console.error('RAJAONGKIR TEST ERROR:', err);
    res.status(500).json({ 
      message: 'Gagal test API RajaOngkir', 
      error: err.response?.data || err.message 
    });
  }
};

module.exports = {
  getApiKeys,
  getApiKey,
  createApiKey,
  updateApiKey,
  deactivateApiKey,
  testRajaOngkirApi
}; 