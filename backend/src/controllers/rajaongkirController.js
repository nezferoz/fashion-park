const axios = require('axios');

const RAJAONGKIR_API_KEY = 'QjaW7HPI3d3b671dad99be68a1HXaUyc';
const BASE_URL = 'https://api.rajaongkir.com/starter';

const getProvinces = async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/province`, {
      headers: { key: RAJAONGKIR_API_KEY }
    });
    res.json(response.data.rajaongkir.results);
  } catch (err) {
    console.error('RajaOngkir getProvinces error:', err.response?.data || err.message, err.stack);
    res.status(500).json({ message: 'Gagal mengambil data provinsi', error: err.message, detail: err.response?.data });
  }
};

const getCities = async (req, res) => {
  try {
    const { province_id } = req.query;
    const url = province_id ? `${BASE_URL}/city?province=${province_id}` : `${BASE_URL}/city`;
    const response = await axios.get(url, {
      headers: { key: RAJAONGKIR_API_KEY }
    });
    res.json(response.data.rajaongkir.results);
  } catch (err) {
    console.error('RajaOngkir getCities error:', err.response?.data || err.message, err.stack);
    res.status(500).json({ message: 'Gagal mengambil data kota', error: err.message, detail: err.response?.data });
  }
};

module.exports = { getProvinces, getCities }; 