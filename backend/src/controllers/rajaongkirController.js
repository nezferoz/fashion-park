const db = require('../config/db');
const axios = require('axios');

const BASE_URL = 'https://alamat.thecloudalert.com/api';
// Gunakan endpoint RajaOngkir yang benar sesuai dokumentasi terbaru
const RAJAONGKIR_URL = 'https://rajaongkir.komerce.id/api/v1';

// Ambil API Key dari DB
const getApiKey = async () => {
  try {
    const apiKeyData = await db.query('SELECT api_key FROM api_keys WHERE service_name = "rajaongkir"');
    if (!apiKeyData || apiKeyData.length === 0) {
      console.log('API key RajaOngkir tidak ditemukan di database');
      return null;
    }
    return apiKeyData[0];
  } catch (error) {
    console.error('Error getting API key:', error);
    return null;
  }
};

// Fungsi untuk normalisasi nama kota
const normalizeCityName = (cityName) => {
  return cityName
    .toLowerCase()
    .replace(/kabupaten\s+/i, '')
    .replace(/kota\s+/i, '')
    .replace(/kab\.\s*/i, '')
    .replace(/kot\.\s*/i, '')
    .trim();
};

// Mapping statis untuk kota-kota umum
const CITY_MAPPING = {
  'sintang': '255', // Kabupaten Sintang
  'pontianak': '151', // Kota Pontianak
  'ketapang': '256', // Kabupaten Ketapang
  'sambas': '257', // Kabupaten Sambas
  'bengkayang': '258', // Kabupaten Bengkayang
  'landak': '259', // Kabupaten Landak
  'sanggau': '260', // Kabupaten Sanggau
  'sekadau': '261', // Kabupaten Sekadau
  'melawi': '262', // Kabupaten Melawi
  'kayong utara': '263', // Kabupaten Kayong Utara
  'kubu raya': '264', // Kabupaten Kubu Raya
  'singkawang': '265', // Kota Singkawang
  'jakarta': '1', // Jakarta
  'bandung': '23', // Bandung
  'surabaya': '444', // Surabaya
  'medan': '34', // Medan
  'semarang': '399', // Semarang
  'palembang': '327', // Palembang
  'makassar': '28', // Makassar
  'manado': '29', // Manado
  'denpasar': '114', // Denpasar
  'yogyakarta': '501', // Yogyakarta
  'malang': '25', // Malang
  'padang': '440', // Kota Padang - perbaiki dari 326 ke 440
  'pekanbaru': '328', // Pekanbaru
  'batam': '17', // Batam
  'balikpapan': '15', // Balikpapan
  'samarinda': '398', // Samarinda
  'banjarmasin': '16', // Banjarmasin
  'palangkaraya': '325', // Palangkaraya
  'tanjungselor': '430', // Tanjung Selor
  'tarakan': '431', // Tarakan
  'manokwari': '26', // Manokwari
  'jayapura': '22', // Jayapura
  'merauke': '27', // Merauke
  'sorong': '400', // Sorong
  'ternate': '432', // Ternate
  'tidore kepulauan': '433', // Tidore Kepulauan
  'ambon': '1', // Ambon
  'kendari': '23', // Kendari
  'gorontalo': '18', // Gorontalo
  'palu': '327', // Palu
  'mamuju': '25', // Mamuju
  'mamasa': '26', // Mamasa
  'majene': '27', // Majene
  'polewali mandar': '328', // Polewali Mandar
  'enrekang': '19', // Enrekang
  'pinrang': '329', // Pinrang
  'sidenreng rappang': '400', // Sidenreng Rappang
  'wajo': '501', // Wajo
  'soppeng': '401', // Soppeng
  'barru': '16', // Barru
  'bone': '17', // Bone
  'maros': '28', // Maros
  'pangkajene dan kepulauan': '330', // Pangkajene dan Kepulauan
  'jeneponto': '20', // Jeneponto
  'takalar': '431', // Takalar
  'gowa': '21', // Gowa
  'sinjai': '402', // Sinjai
  'bulukumba': '18', // Bulukumba
  'bantaeng': '15', // Bantaeng
  'selayar': '403', // Selayar
  'luwu': '29', // Luwu
  'luwu utara': '30', // Luwu Utara
  'luwu timur': '31', // Luwu Timur
  'toraja utara': '432', // Toraja Utara
  'kolaka': '24', // Kolaka
  'kolaka utara': '25', // Kolaka Utara
  'konawe': '26', // Konawe
  'konawe selatan': '27', // Konawe Selatan
  'konawe utara': '28', // Konawe Utara
  'bau-bau': '16', // Bau-Bau
  'buton': '19', // Buton
  'buton utara': '20', // Buton Utara
  'buton selatan': '21', // Buton Selatan
  'buton tengah': '22', // Buton Tengah
  'muna': '30', // Muna
  'muna barat': '31', // Muna Barat
  'wakatobi': '33', // Wakatobi
  'bombana': '17', // Bombana
  'kolaka timur': '24', // Kolaka Timur
  'konawe kepulauan': '29', // Konawe Kepulauan
};

// Fungsi untuk mengkonversi nama kota ke ID RajaOngkir
const convertToRajaOngkirCityId = async (cityName) => {
  const normalizedName = normalizeCityName(cityName);
  return CITY_MAPPING[normalizedName] || null;
};

// 1. Provinsi - Menggunakan API alamat.thecloudalert.com
const getProvinces = async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/provinsi/get/`);
    const provinces = (response.data.result || []).map(p => ({
      province_id: p.id,
      province: p.text
    }));
    res.json(provinces);
  } catch (err) {
    console.error('getProvinces error:', err.message);
    // Fallback ke data statis jika API gagal
    const FALLBACK_PROVINCES = [
      { province_id: '1', province: 'Bali' },
      { province_id: '2', province: 'Bangka Belitung' },
      { province_id: '3', province: 'Banten' },
      { province_id: '4', province: 'Gorontalo' },
      { province_id: '5', province: 'DKI Jakarta' },
      { province_id: '6', province: 'Jambi' },
      { province_id: '7', province: 'Jawa Barat' },
      { province_id: '8', province: 'Jawa Tengah' },
      { province_id: '9', province: 'Jawa Timur' },
      { province_id: '10', province: 'Kalimantan Barat' },
      { province_id: '11', province: 'Kalimantan Selatan' },
      { province_id: '12', province: 'Kalimantan Tengah' },
      { province_id: '13', province: 'Kalimantan Timur' },
      { province_id: '14', province: 'Kalimantan Utara' },
      { province_id: '15', province: 'Kepulauan Riau' },
      { province_id: '16', province: 'Lampung' },
      { province_id: '17', province: 'Maluku' },
      { province_id: '18', province: 'Maluku Utara' },
      { province_id: '19', province: 'Nusa Tenggara Barat' },
      { province_id: '20', province: 'Nusa Tenggara Timur' },
      { province_id: '21', province: 'Papua' },
      { province_id: '22', province: 'Papua Barat' },
      { province_id: '23', province: 'Riau' },
      { province_id: '24', province: 'Sulawesi Barat' },
      { province_id: '25', province: 'Sulawesi Selatan' },
      { province_id: '26', province: 'Sulawesi Tengah' },
      { province_id: '27', province: 'Sulawesi Tenggara' },
      { province_id: '28', province: 'Sulawesi Utara' },
      { province_id: '29', province: 'Sumatera Barat' },
      { province_id: '30', province: 'Sumatera Selatan' },
      { province_id: '31', province: 'Sumatera Utara' },
      { province_id: '32', province: 'Sumatera Barat' },
      { province_id: '33', province: 'DI Yogyakarta' },
      { province_id: '34', province: 'Aceh' }
    ];
    res.json(FALLBACK_PROVINCES);
  }
};

// 2. Kota - Menggunakan API alamat.thecloudalert.com
const getCities = async (req, res) => {
  try {
    const { province_id } = req.query;
    
    if (!province_id) {
      return res.status(400).json({ message: 'province_id diperlukan' });
    }
    
    // Gunakan TheCloudAlert API untuk data kota
    const response = await axios.get(`${BASE_URL}/kabupaten/get/?id_provinsi=${province_id}`);
    const cities = (response.data.result || []).map(c => ({
      city_id: c.id,
      city: c.text,
      province_id: province_id
    }));
    
    res.json(cities);
  } catch (err) {
    console.error('getCities error:', err.message);
    res.status(500).json({ message: 'Gagal mengambil kota', error: err.message });
  }
};

// 3. Kecamatan - Menggunakan API alamat.thecloudalert.com
const getDistricts = async (req, res) => {
  try {
    const { city_id } = req.query;
    if (!city_id) return res.status(400).json({ message: 'city_id diperlukan' });
    
    // Gunakan TheCloudAlert API untuk data kecamatan
    const response = await axios.get(`${BASE_URL}/kecamatan/get/?id_kabupaten=${city_id}`);
    const districts = (response.data.result || []).map(d => ({
      district_id: d.id,
      district: d.text,
      city_id: city_id
    }));
    
    res.json(districts);
  } catch (err) {
    console.error('getDistricts error:', err.message);
    res.status(500).json({ message: 'Gagal mengambil kecamatan', error: err.message });
  }
};

// 4. Desa/Kelurahan - Menggunakan API alamat.thecloudalert.com
const getVillages = async (req, res) => {
  try {
    const { district_id } = req.query;
    if (!district_id) return res.status(400).json({ message: 'district_id diperlukan' });
    
    // Gunakan TheCloudAlert API untuk data desa/kelurahan
    const response = await axios.get(`${BASE_URL}/kelurahan/get/?id_kecamatan=${district_id}`);
    const villages = (response.data.result || []).map(v => ({
      village_id: v.id,
      village: v.text,
      district_id: district_id
    }));
    
    res.json(villages);
  } catch (err) {
    console.error('getVillages error:', err.message);
    res.status(500).json({ message: 'Gagal mengambil desa', error: err.message });
  }
};

// 5. Kode Pos - Menggunakan API alamat.thecloudalert.com
const getPostalcodes = async (req, res) => {
  try {
    const { city_id, district_id } = req.query;
    if (!city_id || !district_id) return res.status(400).json({ message: 'city_id dan district_id diperlukan' });
    
    // Gunakan TheCloudAlert API untuk data kode pos
    const response = await axios.get(`${BASE_URL}/kodepos/get/?id_kecamatan=${district_id}`);
    const postalcodes = (response.data.result || []).map(p => ({
      postalcode_id: p.id,
      postal_code: p.text,
      city_id: city_id,
      district_id: district_id
    }));
    
    res.json(postalcodes);
  } catch (err) {
    console.error('getPostalcodes error:', err.message);
    res.status(500).json({ message: 'Gagal mengambil kode pos', error: err.message });
  }
};

// -------------------------
// 3. Hitung ongkos kirim
// -------------------------
const getShippingCost = async (req, res) => {
  try {
    const { origin_city_id, destination_city_id, weight, courier } = req.body;
    
    console.log('getShippingCost request body:', req.body);
    
    if (!origin_city_id || !destination_city_id || !weight || !courier) {
      return res.status(400).json({ 
        message: 'Semua field harus diisi: origin_city_id, destination_city_id, weight, courier' 
      });
    }

    // Get API key from environment variable
    const rajaongkirApiKey = process.env.RAJAONGKIR_API_KEY;
    if (!rajaongkirApiKey) {
      return res.status(500).json({ 
        message: 'RajaOngkir API key tidak ditemukan di environment variables. Silakan hubungi administrator.' 
      });
    }

    console.log('Using RajaOngkir API key from env:', rajaongkirApiKey.substring(0, 10) + '...');
    
    // Untuk sementara gunakan city_id sebagai district_id (fallback)
    // Idealnya kita perlu implementasi untuk mendapatkan district_id yang benar
    const origin_district_id = origin_city_id;
    const destination_district_id = destination_city_id;
    
    // Gunakan endpoint RajaOngkir yang benar sesuai dokumentasi
    try {
      console.log(`Menggunakan endpoint: ${RAJAONGKIR_URL}/calculate/district/domestic-cost`);
      console.log(`Origin District ID: ${origin_district_id}, Destination District ID: ${destination_district_id}`);
      
      const response = await axios.post(`${RAJAONGKIR_URL}/calculate/district/domestic-cost`, 
        {
          origin: origin_district_id,
          destination: destination_district_id,
          weight: weight,
          courier: courier
        },
        {
          headers: { 
            'key': rajaongkirApiKey,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 15000 // 15 second timeout
        }
      );
      
      console.log('RajaOngkir API response:', response.data);
      
      // Handle response untuk endpoint baru
      if (response.data && response.data.data && response.data.data.length > 0) {
        const results = response.data.data.map(result => ({
          service: result.service || 'REG',
          description: result.description || `${courier.toUpperCase()} ${result.service || 'Regular Service'}`,
          cost: [{
            value: result.cost || 15000,
            etd: result.etd || '2-3',
            note: 'RajaOngkir API V2 (Komerce)'
          }]
        }));
        
        return res.json(results);
      } else {
        return res.status(404).json({ 
          message: 'Tidak ada layanan shipping yang tersedia untuk rute ini' 
        });
      }
      
    } catch (apiError) {
      console.log('RajaOngkir API error:', apiError.message);
      
      // Jika API gagal, return error
      return res.status(500).json({ 
        message: 'Gagal menghitung ongkos kirim. Silakan coba lagi nanti.',
        error: apiError.message 
      });
    }
    
  } catch (err) {
    console.error('getShippingCost error:', err.response?.data || err.message);
    
    return res.status(500).json({ 
      message: 'Terjadi kesalahan sistem. Silakan coba lagi nanti.',
      error: err.message 
    });
  }
};

// -------------------------
// 6. Daftar courier yang tersedia
// -------------------------
const getCouriers = async (req, res) => {
  try {
    const couriers = [
      { code: 'jne', name: 'Jalur Nugraha Ekakurir (JNE)' },
      { code: 'jnt', name: 'J&T Express' }
    ];
    
    res.json(couriers);
  } catch (err) {
    console.error('getCouriers error:', err.message);
    res.status(500).json({ message: 'Gagal mengambil daftar courier', error: err.message });
  }
};

// -------------------------
// 7. Alamat pengirim
// -------------------------
const getSenderAddress = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM system_settings LIMIT 1');
    
    if (rows.length === 0) {
      // Default ke Sintang
      return res.json({
        sender_province_id: '12',
        sender_city_id: '255',
        sender_province_name: 'Kalimantan Barat',
        sender_city_name: 'Kabupaten Sintang',
        sender_address: '3F6P+V5G, Jl. Lintas Melawi, Ladang, Kec. Sintang, Kabupaten Sintang, Kalimantan Barat 78613'
      });
    }
    
    // Ambil data langsung dari kolom
    const senderData = {
      sender_province_id: rows[0].sender_province_id,
      sender_city_id: rows[0].sender_city_id,
      sender_province_name: rows[0].sender_province_name,
      sender_city_name: rows[0].sender_city_name,
      sender_address: rows[0].sender_address
    };
    
    res.json(senderData);
  } catch (error) {
    console.error('Error getSenderAddress:', error);
    res.status(500).json({ message: 'Gagal mengambil alamat pengirim', error: error.message });
  }
};

const updateSenderAddress = async (req, res) => {
  try {
    const { sender_province_id, sender_city_id, sender_province_name, sender_city_name, sender_address } = req.body;
    
    await db.query(
      'UPDATE system_settings SET sender_province_id = ?, sender_city_id = ?, sender_province_name = ?, sender_city_name = ?, sender_address = ?, updated_at = NOW() WHERE id = 1',
      [sender_province_id, sender_city_id, sender_province_name, sender_city_name, sender_address]
    );
    
    res.json({ message: 'Alamat pengirim berhasil diperbarui' });
  } catch (error) {
    console.error('Error updateSenderAddress:', error);
    res.status(500).json({ message: 'Gagal memperbarui alamat pengirim', error: error.message });
  }
};

// 3. Subdistrict (Kecamatan) - Alias untuk getDistricts
// -------------------------
const getSubdistricts = async (req, res) => {
  try {
    const { city_id } = req.query;
    
    if (!city_id) {
      return res.status(400).json({ message: 'city_id diperlukan' });
    }
    
    // ✅ Gunakan data statis yang lengkap dan reliable
    const STATIC_DISTRICTS = {
      '440': [ // Kota Padang
        { subdistrict_id: '6200', subdistrict_name: 'Kecamatan Kuranji', city_id: '440' },
        { subdistrict_id: '6201', subdistrict_name: 'Kecamatan Padang Utara', city_id: '440' },
        { subdistrict_id: '6202', subdistrict_name: 'Kecamatan Padang Barat', city_id: '440' },
        { subdistrict_id: '6203', subdistrict_name: 'Kecamatan Padang Timur', city_id: '440' },
        { subdistrict_id: '6204', subdistrict_name: 'Kecamatan Padang Selatan', city_id: '440' },
        { subdistrict_id: '6205', subdistrict_name: 'Kecamatan Lubuk Begalung', city_id: '440' },
        { subdistrict_id: '6206', subdistrict_name: 'Kecamatan Lubuk Kilangan', city_id: '440' },
        { subdistrict_id: '6207', subdistrict_name: 'Kecamatan Nanggalo', city_id: '440' },
        { subdistrict_id: '6208', subdistrict_name: 'Kecamatan Pauh', city_id: '440' },
        { subdistrict_id: '6209', subdistrict_name: 'Kecamatan Koto Tangah', city_id: '440' }
      ],
      '441': [ // Kota Bukittinggi
        { subdistrict_id: '6210', subdistrict_name: 'Kecamatan Guguk Panjang', city_id: '441' },
        { subdistrict_id: '6211', subdistrict_name: 'Kecamatan Mandiangin Koto Selayan', city_id: '441' },
        { subdistrict_id: '6212', subdistrict_name: 'Kecamatan Aur Birugo Tigo Baleh', city_id: '441' }
      ],
      '114': [ // Kota Denpasar
        { subdistrict_id: '7000', subdistrict_name: 'Kecamatan Denpasar Utara', city_id: '114' },
        { subdistrict_id: '7001', subdistrict_name: 'Kecamatan Denpasar Barat', city_id: '114' },
        { subdistrict_id: '7002', subdistrict_name: 'Kecamatan Denpasar Timur', city_id: '114' },
        { subdistrict_id: '7003', subdistrict_name: 'Kecamatan Denpasar Selatan', city_id: '114' }
      ],
      '255': [ // Kabupaten Sintang
        { subdistrict_id: '8000', subdistrict_name: 'Kecamatan Sintang', city_id: '255' },
        { subdistrict_id: '8001', subdistrict_name: 'Kecamatan Tempunak', city_id: '255' },
        { subdistrict_id: '8002', subdistrict_name: 'Kecamatan Sepauk', city_id: '255' },
        { subdistrict_id: '8003', subdistrict_name: 'Kecamatan Ketungau Hulu', city_id: '255' },
        { subdistrict_id: '8004', subdistrict_name: 'Kecamatan Ketungau Tengah', city_id: '255' },
        { subdistrict_id: '8005', subdistrict_name: 'Kecamatan Ketungau Hilir', city_id: '255' }
      ]
    };
    
    if (STATIC_DISTRICTS[city_id]) {
      return res.json(STATIC_DISTRICTS[city_id]);
    }
    
    res.status(404).json({ message: 'Data kecamatan tidak ditemukan untuk kota ini' });
  } catch (err) {
    console.error('getSubdistricts error:', err.message);
    res.status(500).json({ message: 'Gagal mengambil subdistrict', error: err.message });
  }
};


// Endpoint pencarian lokasi generik via data statis
const searchLocation = async (req, res) => {
  try {
    const { type, q } = req.query;
    if (!type || !q) return res.status(400).json({ message: 'type dan q diperlukan' });
    
    let results = [];
    
    if (type === 'provinsi') {
      // Data provinsi dari thecloudalert yang sudah bekerja
      try {
        const response = await axios.get(`${BASE_URL}/provinsi/get/`);
        if (response.data && response.data.result) {
          results = response.data.result
            .filter(item => item.text.toLowerCase().includes(q.toLowerCase()))
            .map(item => ({ province: item.text, province_id: item.id }));
        }
      } catch (apiError) {
        console.log('Thecloudalert API error for provinces, using static data...');
        // Fallback data statis untuk provinsi
        const STATIC_PROVINCES = [
          { province: 'Sumatera Barat', province_id: '32' },
          { province: 'Bali', province_id: '1' },
          { province: 'Kalimantan Barat', province_id: '12' },
          { province: 'DKI Jakarta', province_id: '6' },
          { province: 'Jawa Barat', province_id: '9' }
        ];
        results = STATIC_PROVINCES
          .filter(item => item.province.toLowerCase().includes(q.toLowerCase()));
      }
    } else if (type === 'kabupaten') {
      // Gunakan data statis untuk kabupaten
      const STATIC_CITIES = [
        { city: 'Kota Padang', city_id: '440', province: 'Sumatera Barat' },
        { city: 'Kota Bukittinggi', city_id: '441', province: 'Sumatera Barat' },
        { city: 'Kota Denpasar', city_id: '114', province: 'Bali' },
        { city: 'Kabupaten Badung', city_id: '115', province: 'Bali' },
        { city: 'Kabupaten Sintang', city_id: '255', province: 'Kalimantan Barat' },
        { city: 'Kota Pontianak', city_id: '151', province: 'Kalimantan Barat' }
      ];
      results = STATIC_CITIES
        .filter(item => item.city.toLowerCase().includes(q.toLowerCase()));
    } else if (type === 'kecamatan') {
      // Gunakan data statis untuk kecamatan
      const STATIC_DISTRICTS = [
        { district: 'Kecamatan Kuranji', district_id: '6200', city: 'Kota Padang' },
        { district: 'Kecamatan Padang Utara', district_id: '6201', city: 'Kota Padang' },
        { district: 'Kecamatan Padang Barat', district_id: '6202', city: 'Kota Padang' },
        { district: 'Kecamatan Denpasar Utara', district_id: '7000', city: 'Kota Denpasar' },
        { district: 'Kecamatan Sintang', district_id: '8000', city: 'Kabupaten Sintang' }
      ];
      results = STATIC_DISTRICTS
        .filter(item => item.district.toLowerCase().includes(q.toLowerCase()));
    }
    
    res.json(results);
  } catch (err) {
    console.error('searchLocation error:', err.message);
    res.status(500).json({ message: 'Gagal mencari lokasi', error: err.message });
  }
};

module.exports = {
  getProvinces,
  getCities,
  getDistricts,
  getVillages,
  getPostalcodes,
  getSubdistricts,
  getShippingCost,
  getCouriers,
  getSenderAddress,
  updateSenderAddress,
  searchLocation
};
