import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaSave, FaSignOutAlt } from 'react-icons/fa';
import api from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';

const AkunSayaAdmin = () => {
  const { user, logout } = useAuth();
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/profile');
      setProfileData({
        name: res.data.name || '',
        email: res.data.email || '',
        phone: res.data.phone || '',
        address: res.data.address || ''
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Gagal mengambil data profil');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      
      // Update profile data
      await api.put('/users/profile', profileData);
      setSuccess('Profil berhasil diperbarui');
      
      // Clear password fields
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Gagal memperbarui profil');
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      
      if (passwordData.new_password !== passwordData.confirm_password) {
        setError('Password baru dan konfirmasi password tidak cocok');
        return;
      }
      
      if (passwordData.new_password.length < 6) {
        setError('Password baru minimal 6 karakter');
        return;
      }
      
      await api.put('/users/profile', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      
      setSuccess('Password berhasil diperbarui');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (err) {
      console.error('Error updating password:', err);
      setError('Gagal memperbarui password');
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 bg-gray-50">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-600">Memuat data profil...</div>
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
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Informasi Profil Admin</h2>
            <form className="space-y-6" onSubmit={handleProfileUpdate}>
              <div>
                <label htmlFor="name" className="block text-lg font-semibold text-gray-700 mb-2">Nama Lengkap</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-lg font-semibold text-gray-700 mb-2">Alamat Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-lg font-semibold text-gray-700 mb-2">Nomor Telepon</label>
                <input 
                  type="text" 
                  id="phone" 
                  name="phone" 
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-lg font-semibold text-gray-700 mb-2">Alamat</label>
                <textarea 
                  id="address" 
                  name="address" 
                  value={profileData.address}
                  onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>

              <div className="flex justify-start pt-6">
                <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center gap-2 text-lg">
                  <FaSave />
                  Simpan Perubahan
                </button>
              </div>
            </form>

            {/* Password Update Section */}
            <div className="mt-8 pt-8 border-t">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Ubah Password</h3>
              <form className="space-y-6" onSubmit={handlePasswordUpdate}>
                <div>
                  <label htmlFor="current_password" className="block text-lg font-semibold text-gray-700 mb-2">Password Saat Ini</label>
                  <input 
                    type="password" 
                    id="current_password" 
                    name="current_password" 
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <label htmlFor="new_password" className="block text-lg font-semibold text-gray-700 mb-2">Password Baru</label>
                  <input 
                    type="password" 
                    id="new_password" 
                    name="new_password" 
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <label htmlFor="confirm_password" className="block text-lg font-semibold text-gray-700 mb-2">Konfirmasi Password Baru</label>
                  <input 
                    type="password" 
                    id="confirm_password" 
                    name="confirm_password" 
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>

                <div className="flex justify-start pt-6">
                  <button type="submit" className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-all flex items-center gap-2 text-lg">
                    <FaSave />
                    Ubah Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Kolom Kanan - Foto & Logout */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
            <FaUserCircle className="text-9xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800">{profileData.name || 'Admin'}</h3>
            <p className="text-gray-500 mb-6">{user?.role || 'Admin'}</p>
            <div className="text-sm text-gray-600 mb-6">
              <p>Email: {profileData.email}</p>
              {profileData.phone && <p>Telepon: {profileData.phone}</p>}
            </div>
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

// We rename the component to AkunSaya and export it as default
const AkunSaya = AkunSayaAdmin;
export default AkunSaya; 