import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaSave, FaSignOutAlt } from 'react-icons/fa';
import api from '../../utils/api';

const AkunSayaPemilik = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUser(userData);
      setFormData(prev => ({
        ...prev,
        name: userData.name || '',
        email: userData.email || ''
      }));
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
        email: formData.email
      };

      if (formData.new_password) {
        updateData.current_password = formData.current_password;
        updateData.new_password = formData.new_password;
      }

      // Update profile
      const response = await api.put(`/users/${user.user_id}`, updateData);
      
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
      <div className="flex-1 p-8 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data profil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 p-8 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Tidak dapat memuat data profil</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Akun</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kolom Kiri - Informasi Profil */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Informasi Profil</h2>
            <form className="space-y-6" onSubmit={handleProfileUpdate}>
              <div>
                <label htmlFor="name" className="block text-lg font-semibold text-gray-700 mb-2">Nama Lengkap</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
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

              <h3 className="text-xl font-bold text-gray-800 pt-4 border-t mt-8">Ubah Password</h3>
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
              <div>
                <label htmlFor="confirm_password" className="block text-lg font-semibold text-gray-700 mb-2">Konfirmasi Password Baru</label>
                <input 
                  type="password" 
                  id="confirm_password" 
                  name="confirm_password" 
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>

              <div className="flex justify-start pt-6">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      Simpan Perubahan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Kolom Kanan - Foto & Logout */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
            <FaUserCircle className="text-9xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800">{user.name || 'Nama Pemilik'}</h3>
            <p className="text-gray-500 mb-2">{user.email}</p>
            <p className="text-gray-500 mb-6 capitalize">{user.role || 'Owner'}</p>
            <button className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 mb-4" disabled>
              Ubah Foto Profil (belum tersedia)
            </button>
            <button 
              onClick={handleLogout}
              className="w-full bg-red-500 text-white py-3 rounded-lg font-bold hover:bg-red-600 transition-all flex items-center justify-center gap-2 text-lg">
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AkunSayaPemilik; 