import React, { useState, useEffect } from "react";
import api from "../../utils/api";

const PengaturanAlamatPengirim = () => {
  const [senderAddress, setSenderAddress] = useState({
    province_id: '',
    city_id: '',
    province_name: '',
    city_name: '',
    address: ''
  });
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load data saat komponen mount
  useEffect(() => {
    fetchSenderAddress();
    fetchProvinces();
  }, []);

  // Load kota saat provinsi berubah
  useEffect(() => {
    if (senderAddress.province_id) {
      fetchCities(senderAddress.province_id);
    }
  }, [senderAddress.province_id]);

  const fetchSenderAddress = async () => {
    try {
      const response = await api.get('/rajaongkir/sender-address');
      setSenderAddress(response.data);
    } catch (err) {
      console.error('Gagal mengambil alamat pengirim:', err);
      setError("Gagal mengambil alamat pengirim");
    } finally {
      setLoading(false);
    }
  };

  const fetchProvinces = async () => {
    try {
      const response = await api.get('/rajaongkir/provinces');
      setProvinces(response.data);
    } catch (err) {
      console.error('Gagal mengambil data provinsi:', err);
      setError("Gagal mengambil data provinsi");
    }
  };

  const fetchCities = async (provinceId) => {
    try {
      const response = await api.get(`/rajaongkir/cities?province_id=${provinceId}`);
      setCities(response.data);
    } catch (err) {
      console.error('Gagal mengambil data kota:', err);
      setError("Gagal mengambil data kota");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSenderAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProvinceChange = (e) => {
    const provinceId = e.target.value;
    const province = provinces.find(p => p.province_id === provinceId);
    
    setSenderAddress(prev => ({
      ...prev,
      province_id: provinceId,
      province_name: province ? province.province : '',
      city_id: '',
      city_name: ''
    }));
  };

  const handleCityChange = (e) => {
    const cityId = e.target.value;
    const city = cities.find(c => c.city_id === cityId);
    
    setSenderAddress(prev => ({
      ...prev,
      city_id: cityId,
      city_name: city ? `${city.type} ${city.city_name}` : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!senderAddress.province_id || !senderAddress.city_id || !senderAddress.address) {
      setError("Semua field harus diisi");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    
    try {
      await api.put('/rajaongkir/sender-address', senderAddress);
      setSuccess("Alamat pengirim berhasil diupdate");
    } catch (err) {
      setError("Gagal update alamat pengirim: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12 flex-1">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow p-8 border border-blue-100">
          <h2 className="text-2xl font-bold mb-6 text-center">Pengaturan Alamat Pengirim</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provinsi Pengirim
                </label>
                <select
                  name="province_id"
                  value={senderAddress.province_id}
                  onChange={handleProvinceChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Pilih Provinsi</option>
                  {provinces.map((province) => (
                    <option key={province.province_id} value={province.province_id}>
                      {province.province}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kota/Kabupaten Pengirim
                </label>
                <select
                  name="city_id"
                  value={senderAddress.city_id}
                  onChange={handleCityChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!senderAddress.province_id}
                  required
                >
                  <option value="">Pilih Kota</option>
                  {cities.map((city) => (
                    <option key={city.city_id} value={city.city_id}>
                      {city.type} {city.city_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alamat Lengkap Pengirim
              </label>
              <textarea
                name="address"
                value={senderAddress.address}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan alamat lengkap pengirim..."
                required
              />
            </div>
            
            <div className="text-center">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-8 py-3 rounded font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {saving ? "Menyimpan..." : "Simpan Alamat Pengirim"}
              </button>
            </div>
          </form>
          
          {/* Informasi Tambahan */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-2">Informasi:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Alamat pengirim akan digunakan sebagai origin untuk perhitungan ongkir</li>
              <li>• Pastikan alamat lengkap dan akurat</li>
              <li>• Perubahan alamat akan mempengaruhi perhitungan ongkir untuk semua pelanggan</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PengaturanAlamatPengirim; 