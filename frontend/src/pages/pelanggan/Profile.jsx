import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaClipboardList, FaUser, FaHistory } from 'react-icons/fa';
import api from "../../utils/api";
import { jwtDecode } from "../../utils/jwtDecode";
import { getImageUrl } from "../../utils/imageUtils";

function getUserId() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    console.log('User from localStorage:', user);
    if (user?.userId) {
      console.log('Using userId from localStorage:', user.userId);
      return user.userId;
    }
    // Fallback: try to decode JWT token
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      console.log('Decoded JWT token:', decoded);
      return decoded?.user_id;
    }
    console.log('No user ID found');
    return null;
  } catch (error) {
    console.error('Error in getUserId:', error);
    return null;
  }
}

// Tambahkan fungsi normalisasi nama kota
function toTitleCase(str) {
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

// Tambahkan komponen AutocompleteInput
function AutocompleteInput({ label, type, value, onChange, placeholder }) {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (inputValue.length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    api.get(`/rajaongkir/search-location?type=${type}&q=${encodeURIComponent(inputValue)}`)
      .then(res => setSuggestions(res.data))
      .catch(() => setSuggestions([]))
      .finally(() => setLoading(false));
  }, [inputValue, type]);

  return (
    <div className="relative">
      <label className="block mb-1 font-medium">{label}</label>
      <input
        type="text"
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={inputValue}
        placeholder={placeholder}
        onChange={e => {
          setInputValue(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 bg-white border border-gray-300 w-full max-h-48 overflow-y-auto rounded shadow">
          {suggestions.map((item, idx) => (
            <li
              key={idx}
              className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
              onClick={() => {
                setInputValue(type === 'provinsi' ? item.province : type === 'kabupaten' ? item.city : item.district);
                setShowSuggestions(false);
                onChange(item);
              }}
            >
              {type === 'provinsi' && item.province}
              {type === 'kabupaten' && `${item.city}, ${item.province}`}
              {type === 'kecamatan' && `${item.district}, ${item.city}, ${item.province}`}
            </li>
          ))}
        </ul>
      )}
      {loading && <div className="text-xs text-gray-400 mt-1">Memuat...</div>}
    </div>
  );
}

const Profile = () => {
  const navigate = useNavigate();
  const userId = getUserId();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  if (!userId) {
    window.location.href = '/login';
    return null;
  }

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    province_id: '',
    city_id: '',
    district_id: '',
    village_id: '',
    postal_code: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [villages, setVillages] = useState([]);
  const [postalcodes, setPostalcodes] = useState([]);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' atau 'pesanan'
  const [pesanan, setPesanan] = useState([]);
  const [loadingPesanan, setLoadingPesanan] = useState(false);


  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!userId) {
          setError("User ID tidak ditemukan");
          setLoading(false);
          return;
        }
        console.log('Fetching profile for userId:', userId);
        const res = await api.get(`/users/${userId}`);
        setUser(res.data);
        setFormData(prev => ({
          ...prev,
          name: res.data.name || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          address: res.data.address || '',
          province_id: res.data.province_id || '',
          city_id: res.data.city_id || '',
          district_id: res.data.district_id || '',
          village_id: res.data.village_id || '',
          postal_code: res.data.postal_code || ''
        }));
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError("Gagal mengambil data profil");
      }
      setLoading(false);
    };
    fetchProfile();
  }, [userId]);

  useEffect(() => {
    if (activeTab === 'pesanan') {
      fetchPesanan();
    }
  }, [activeTab]);

  // Load data provinsi dan kota
  useEffect(() => {
    api.get('/rajaongkir/provinces').then(res => setProvinces(res.data)).catch(() => setProvinces([]));
  }, []);

  useEffect(() => {
    if (formData.province_id) {
      api.get(`/rajaongkir/cities?province_id=${formData.province_id}`).then(res => setCities(res.data)).catch(() => setCities([]));
      setDistricts([]); setVillages([]); setPostalcodes([]);
    } else {
      setCities([]); setDistricts([]); setVillages([]); setPostalcodes([]);
    }
  }, [formData.province_id]);

  useEffect(() => {
    if (formData.city_id) {
      api.get(`/rajaongkir/districts?city_id=${formData.city_id}`).then(res => setDistricts(res.data)).catch(() => setDistricts([]));
      setVillages([]); setPostalcodes([]);
    } else {
      setDistricts([]); setVillages([]); setPostalcodes([]);
    }
  }, [formData.city_id]);

  useEffect(() => {
    if (formData.district_id) {
      api.get(`/rajaongkir/villages?district_id=${formData.district_id}`).then(res => setVillages(res.data)).catch(() => setVillages([]));
      // Ambil kodepos juga
      if (formData.city_id) {
        api.get(`/rajaongkir/postalcodes?city_id=${formData.city_id}&district_id=${formData.district_id}`)
          .then(res => {
            setPostalcodes(res.data);
            if (res.data.length === 1) setFormData(prev => ({ ...prev, postal_code: res.data[0].postal_code }));
          })
          .catch(() => setPostalcodes([]));
      }
    } else {
      setVillages([]); setPostalcodes([]);
    }
  }, [formData.district_id]);

  const fetchPesanan = async () => {
    setLoadingPesanan(true);
    try {
      console.log('Fetching pesanan for userId:', userId);
      const res = await api.get(`/transactions/user/${userId}`);
      console.log('Pesanan response:', res.data);
      
      // Ambil detail produk untuk setiap transaksi
      const pesananWithDetails = await Promise.all(
        res.data.map(async (transaction) => {
          try {
            // Ambil detail transaksi dengan produk menggunakan endpoint untuk user
            const detailRes = await api.get(`/transactions/${transaction.transaction_id}/details/user?userId=${userId}`);
            console.log(`Detail for transaction ${transaction.transaction_id}:`, detailRes.data);
            
            return {
              ...transaction,
              transaction_details: detailRes.data || []
            };
          } catch (error) {
            console.error(`Error fetching details for transaction ${transaction.transaction_id}:`, error);
            return {
              ...transaction,
              transaction_details: []
            };
          }
        })
      );
      
      console.log('Pesanan with details:', pesananWithDetails);
      setPesanan(pesananWithDetails);
    } catch (error) {
      console.error('Error fetching pesanan:', error);
      setError("Gagal mengambil data pesanan");
    }
    setLoadingPesanan(false);
  };



  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'province_id') {
      setFormData(prev => ({ ...prev, city_id: '', district_id: '', village_id: '', postal_code: '' }));
      if (value) {
        api.get(`/rajaongkir/cities?province_id=${value}`).then(res => setCities(res.data)).catch(() => setCities([]));
        setDistricts([]); setVillages([]); setPostalcodes([]);
      } else {
        setCities([]); setDistricts([]); setVillages([]); setPostalcodes([]);
      }
    }
    if (name === 'city_id') {
      setFormData(prev => ({ ...prev, district_id: '', village_id: '', postal_code: '' }));
      if (value) {
        api.get(`/rajaongkir/districts?city_id=${value}`).then(res => setDistricts(res.data)).catch(() => setDistricts([]));
        setVillages([]); setPostalcodes([]);
      } else {
        setDistricts([]); setVillages([]); setPostalcodes([]);
      }
    }
    if (name === 'district_id') {
      setFormData(prev => ({ ...prev, village_id: '', postal_code: '' }));
      if (value) {
        api.get(`/rajaongkir/villages?district_id=${value}`).then(res => setVillages(res.data)).catch(() => setVillages([]));
        // Ambil kodepos juga
        if (formData.city_id) {
          api.get(`/rajaongkir/postalcodes?city_id=${formData.city_id}&district_id=${value}`)
            .then(res => {
              setPostalcodes(res.data);
              if (res.data.length === 1) setFormData(prev => ({ ...prev, postal_code: res.data[0].postal_code }));
            })
            .catch(() => setPostalcodes([]));
        }
      } else {
        setVillages([]); setPostalcodes([]);
      }
    }
    if (name === 'village_id') {
      setFormData(prev => ({ ...prev, postal_code: '' }));
      // Tidak perlu fetch kodepos lagi, sudah diambil saat pilih kecamatan
    }
    if (name === 'postal_code') {
      // manual select kodepos
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      setLoading(true);
      
      // Validate password change
      if (formData.new_password) {
        if (!formData.current_password) {
          setError('Password saat ini harus diisi untuk mengubah password');
          return;
        }
        if (formData.new_password !== formData.confirm_password) {
          setError('Password baru dan konfirmasi password tidak cocok');
          return;
        }
        if (formData.new_password.length < 6) {
          setError('Password baru minimal 6 karakter');
          return;
        }
      }

      // Prepare update data
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        province_id: formData.province_id,
        city_id: formData.city_id,
        district_id: formData.district_id,
        village_id: formData.village_id,
        postal_code: formData.postal_code
      };

      if (formData.new_password) {
        updateData.current_password = formData.current_password;
        updateData.new_password = formData.new_password;
      }

      // Update profile
      const response = await api.put(`/users/${userId}`, updateData);
      
      // Update localStorage with new data
      const updatedUser = { ...user, ...response.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setSuccess('Profil berhasil diperbarui');
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: ''
      }));
      
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data profil...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-blue-600 text-white p-4 flex items-center justify-between">
        <span className="text-xl font-bold">Fashion Park</span>
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Sidebar */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileMenu(false)}></div>
          <div className="fixed left-0 top-0 h-full w-64 bg-blue-600 text-white shadow-lg">
            {/* Mobile Sidebar Header */}
            <div className="flex items-center justify-between h-16 px-6 border-b border-blue-700">
              <span className="text-xl font-bold">Fashion Park</span>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Mobile Navigation Menu */}
            <nav className="flex flex-col gap-2 px-4 py-6">
              <button
                onClick={() => {
                  setActiveTab('profile');
                  setShowMobileMenu(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all duration-150 border-l-4 ${
                  activeTab === 'profile' 
                    ? 'bg-white text-blue-600 border-blue-700' 
                    : 'text-white hover:bg-blue-700'
                }`}
              >
                <FaUser className={`text-lg ${activeTab === 'profile' ? 'text-blue-600' : ''}`} />
                <span className={activeTab === 'profile' ? 'text-blue-600' : ''}>Akun</span>
              </button>
              <button
                onClick={() => {
                  navigate('/pelanggan/status-pesanan');
                  setShowMobileMenu(false);
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-150 border-l-4 text-white hover:bg-blue-700"
              >
                <FaClipboardList className="text-lg" />
                <span>Pesanan</span>
              </button>
              <button
                onClick={() => {
                  navigate('/pelanggan/riwayat');
                  setShowMobileMenu(false);
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-150 border-l-4 text-white hover:bg-blue-700"
              >
                <FaHistory className="text-lg" />
                <span>Riwayat Belanja</span>
              </button>
              
              {/* Tombol Kembali di Mobile Sidebar */}
              <div className="mt-6 pt-6 border-t border-blue-700">
                <button
                  onClick={() => {
                    navigate('/');
                    setShowMobileMenu(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-150 border-l-4 text-white hover:bg-blue-700 w-full"
                >
                  <span className="text-xl">←</span>
                  <span>Kembali ke Beranda</span>
                </button>
              </div>
            </nav>
            
            {/* Mobile User Info */}
            <div className="px-4 py-4 border-t border-blue-700 mt-auto">
              <span className="block text-sm font-semibold text-white">{user?.name || 'pelanggan'} (pelanggan)</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar - Desktop */}
        <div className="hidden lg:block w-64 bg-blue-600 text-white flex flex-col shadow-lg min-h-screen">
          {/* Header */}
          <div className="flex items-center h-16 px-6 font-bold text-2xl tracking-tight border-b border-blue-700 bg-blue-600 flex-shrink-0">
            <span className="text-white">Fashion Park</span>
          </div>
          
          {/* Navigation Menu */}
          <nav className="flex-1 flex flex-col gap-2 px-4 py-6 bg-blue-600 min-h-0">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all duration-150 border-l-4 ${
                activeTab === 'profile' 
                  ? 'bg-white text-blue-600 border-blue-700 hover:bg-gray-50' 
                  : 'text-white hover:bg-blue-700'
              }`}
            >
              <FaUser className={`text-lg ${activeTab === 'profile' ? 'text-blue-600' : ''}`} />
              <span className={activeTab === 'profile' ? 'text-blue-600' : ''}>Akun</span>
            </button>
            <button
              onClick={() => navigate('/pelanggan/status-pesanan')}
              className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-150 border-l-4 text-white hover:bg-blue-700"
            >
              <FaClipboardList className="text-lg" />
              <span>Pesanan</span>
            </button>
            <button
              onClick={() => navigate('/pelanggan/riwayat')}
              className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-150 border-l-4 text-white hover:bg-blue-700"
            >
              <FaHistory className="text-lg" />
              <span>Riwayat Belanja</span>
            </button>
            
            {/* Tombol Kembali di Sidebar */}
            <div className="mt-6 pt-6 border-t border-blue-700">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-150 border-l-4 text-white hover:bg-blue-700 w-full"
              >
                <span className="text-xl">←</span>
                <span>Kembali ke Beranda</span>
              </button>
            </div>
          </nav>
          
          {/* User Info */}
          <div className="px-4 py-4 border-t border-blue-700 bg-blue-600 flex-shrink-0">
            <span className="block text-sm font-semibold text-white">{user.name || 'pelanggan'} (pelanggan)</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-3 sm:p-4 lg:p-4 overflow-y-auto bg-gray-50">

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              {success}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-lg">
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-800">
                {activeTab === 'profile' ? 'Akun' : 'Pesanan Saya'}
              </h1>
            </div>

            {/* Content */}
            <div className="p-8">
              {activeTab === 'profile' ? (
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
                  {/* Form Section */}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Informasi Profil</h2>
                    <form className="space-y-6" onSubmit={handleProfileUpdate}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="name" className="block text-lg font-semibold text-gray-700 mb-2">Nama Lengkap</label>
                          <input 
                            type="text" 
                            id="name" 
                            name="name" 
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base" 
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-lg font-semibold text-gray-700 mb-2">Alamat Email</label>
                          <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="phone" className="block text-lg font-semibold text-gray-700 mb-2">Nomor Telepon</label>
                          <input 
                            type="tel" 
                            id="phone" 
                            name="phone" 
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                          />
                        </div>
                        <div>
                          <label htmlFor="address" className="block text-lg font-semibold text-gray-700 mb-2">Alamat Lengkap</label>
                          <textarea 
                            id="address" 
                            name="address" 
                            value={formData.address}
                            onChange={handleInputChange}
                            rows="3"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                          />
                        </div>
                      </div>

                      {/* Location Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="province_id" className="block text-lg font-semibold text-gray-700 mb-2">Provinsi</label>
                          <select 
                            id="province_id" 
                            name="province_id" 
                            value={formData.province_id}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Pilih Provinsi</option>
                            {provinces.map(province => (
                              <option key={province.province_id} value={province.province_id}>
                                {province.province}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label htmlFor="city_id" className="block text-lg font-semibold text-gray-700 mb-2">Kota/Kabupaten</label>
                          <select 
                            id="city_id" 
                            name="city_id" 
                            value={formData.city_id}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Pilih Kota/Kabupaten</option>
                            {cities.map(city => (
                              <option key={city.city_id} value={city.city_id}>
                                {city.city}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="district_id" className="block text-lg font-semibold text-gray-700 mb-2">Kecamatan</label>
                          <select 
                            id="district_id" 
                            name="district_id" 
                            value={formData.district_id}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Pilih Kecamatan</option>
                            {districts.map(district => (
                              <option key={district.district_id} value={district.district_id}>
                                {district.district}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label htmlFor="village_id" className="block text-lg font-semibold text-gray-700 mb-2">Desa/Kelurahan</label>
                          <select 
                            id="village_id" 
                            name="village_id" 
                            value={formData.village_id}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Pilih Desa/Kelurahan</option>
                            {villages.map(village => (
                              <option key={village.village_id} value={village.village_id}>
                                {village.village}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label htmlFor="postal_code" className="block text-lg font-semibold text-gray-700 mb-2">Kode Pos</label>
                          <select 
                            id="postal_code" 
                            name="postal_code" 
                            value={formData.postal_code}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Pilih Kode Pos</option>
                            {postalcodes.map(postal => (
                              <option key={postal.postal_code} value={postal.postal_code}>
                                {postal.postal_code}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Password Section */}
                      <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">Ubah Password</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="current_password" className="block text-lg font-semibold text-gray-700 mb-2">Password Saat Ini</label>
                            <input 
                              type="password" 
                              id="current_password" 
                              name="current_password" 
                              value={formData.current_password}
                              onChange={handleInputChange}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            />
                          </div>
                          <div>
                            <label htmlFor="new_password" className="block text-lg font-semibold text-gray-700 mb-2">Password Baru</label>
                            <input 
                              type="password" 
                              id="new_password" 
                              name="new_password" 
                              value={formData.new_password}
                              onChange={handleInputChange}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            />
                          </div>
                        </div>
                        <div className="mt-4">
                          <label htmlFor="confirm_password" className="block text-lg font-semibold text-gray-700 mb-2">Konfirmasi Password</label>
                          <input 
                            type="password" 
                            id="confirm_password" 
                            name="confirm_password" 
                            value={formData.confirm_password}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 pt-6">
                        <button 
                          type="submit" 
                          disabled={loading}
                          className="flex-1 bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                        <button 
                          type="button" 
                          onClick={handleLogout}
                          className="flex-1 bg-red-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-red-700 transition-all"
                        >
                          Logout
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              ) : (
                /* Pesanan Saya Content - Seperti Shopee/Tokopedia */
                <div>
                  <h2 className="text-lg lg:text-xl font-bold text-gray-800 mb-4 lg:mb-6">Daftar Pesanan Saya</h2>
                  {loadingPesanan ? (
                    <div className="flex items-center justify-center py-8 lg:py-12">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 lg:h-12 lg:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600 text-sm lg:text-base">Memuat data pesanan...</p>
                      </div>
                    </div>
                  ) : pesanan.length === 0 ? (
                    <div className="text-center py-8 lg:py-12">
                      <FaClipboardList className="text-4xl lg:text-6xl text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg lg:text-xl font-semibold text-gray-600 mb-2">Belum Ada Pesanan</h3>
                      <p className="text-gray-500 text-sm lg:text-base">Anda belum memiliki pesanan aktif</p>
                    </div>
                  ) : (
                    <div className="space-y-4 lg:space-y-6">
                      {pesanan.map((order, index) => (
                        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6 hover:shadow-lg transition-shadow">
                          {/* Header Pesanan */}
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4 pb-4 border-b border-gray-100">
                            <div>
                              <h3 className="text-base lg:text-lg font-semibold text-gray-800">Pesanan #{order.transaction_id}</h3>
                              <p className="text-gray-600 text-xs lg:text-sm">
                                {new Date(order.created_at).toLocaleDateString('id-ID', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            <span className={`px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-semibold ${
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'completed' ? 'bg-green-100 text-green-800' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status === 'pending' ? 'Menunggu Pembayaran' :
                               order.status === 'completed' ? 'Selesai' :
                               order.status === 'cancelled' ? 'Dibatalkan' :
                               order.status}
                            </span>
                          </div>

                          {/* Detail Produk */}
                          <div className="mb-4">
                            <h4 className="font-medium text-gray-800 mb-3 text-sm lg:text-base">Produk yang Dipesan:</h4>
                            {order.transaction_details && order.transaction_details.length > 0 ? (
                              <div className="space-y-3">
                                {order.transaction_details.map((detail, detailIndex) => (
                                  <div key={detailIndex} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                                    {/* Gambar Produk */}
                                    <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                      {detail.product?.main_image_id ? (
                                        <img
                                          src={getProductImageUrl(detail.product.product_id, detail.product.main_image_id)}
                                          alt={detail.product?.product_name || 'Produk'}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                          }}
                                        />
                                      ) : null}
                                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl" style={{ display: detail.product?.main_image_id ? 'none' : 'flex' }}>
                                        {detail.product?.product_name ? detail.product.product_name.charAt(0).toUpperCase() : '📷'}
                                      </div>
                                    </div>
                                    
                                    {/* Informasi Produk */}
                                    <div className="flex-1 min-w-0">
                                      <h5 className="font-semibold text-gray-800 text-sm lg:text-base truncate">
                                        {detail.product?.product_name || 'Nama Produk Tidak Tersedia'}
                                      </h5>
                                      <div className="flex items-center gap-4 text-xs lg:text-sm text-gray-600 mt-1">
                                        <span>Ukuran: {detail.variant?.size || 'Standard'}</span>
                                        <span>Qty: {detail.quantity || 0}</span>
                                        <span className="font-semibold text-gray-800">
                                          Rp {(detail.price || 0).toLocaleString('id-ID')}
                                        </span>
                                      </div>
                                      {detail.product?.description && (
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                          {detail.product.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="bg-gray-50 p-3 rounded">
                                <p className="text-gray-600 text-xs lg:text-sm">Detail produk tidak tersedia</p>
                              </div>
                            )}
                          </div>

                          {/* Informasi Pembayaran */}
                          <div className="bg-blue-50 p-3 lg:p-4 rounded-lg mb-4">
                            <h4 className="font-medium text-gray-800 mb-2 text-sm lg:text-base">Informasi Pembayaran:</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                              <div>
                                <span className="text-gray-600 text-xs lg:text-sm">Total Pembayaran:</span>
                                <span className="block text-base lg:text-lg font-bold text-gray-800">
                                  Rp {order.total_amount?.toLocaleString('id-ID') || '0'}
                                </span>
                              </div>
                              {order.payment_method && (
                                <div>
                                  <span className="text-gray-600 text-xs lg:text-sm">Metode Pembayaran:</span>
                                  <span className="block text-gray-800 capitalize text-sm lg:text-base">{order.payment_method}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Informasi Pengiriman */}
                          <div className="bg-green-50 p-3 lg:p-4 rounded-lg mb-4">
                            <h4 className="font-medium text-gray-800 mb-2 text-sm lg:text-base">Informasi Pengiriman:</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                              <div>
                                <span className="text-gray-600 text-xs lg:text-sm">Status Pengiriman:</span>
                                <span className="block text-gray-800 font-medium text-sm lg:text-base">
                                  {order.status === 'completed' ? 'Dikirim' : 'Menunggu Pengiriman'}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600 text-xs lg:text-sm">Resi:</span>
                                <span className="block text-gray-800 font-medium text-sm lg:text-base">
                                  {order.waybill_number || 'Belum tersedia'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Invoice */}
                          <div className="bg-gray-50 p-3 lg:p-4 rounded-lg">
                            <h4 className="font-medium text-gray-800 mb-2 text-sm lg:text-base">Invoice:</h4>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                              <span className="text-gray-600 text-xs lg:text-sm">Invoice #{order.transaction_id}</span>
                              <button className="bg-blue-600 text-white px-3 lg:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-xs lg:text-sm">
                                Download Invoice
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 