import React from 'react';
import { FaUserCircle, FaSave, FaSignOutAlt } from 'react-icons/fa';

const AkunSayaKasir = () => {

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    // TODO: Implementasi update profil ke backend
    alert('Perubahan profil berhasil disimpan (dummy handler)');
  };

  return (
    <div className="flex-1 p-8 bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Akun Saya</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kolom Kiri - Informasi Profil */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Informasi Profil Kasir</h2>
            <form className="space-y-6" onSubmit={handleProfileUpdate}>
              <div>
                <label htmlFor="name" className="block text-lg font-semibold text-gray-700 mb-2">Nama Lengkap</label>
                <input type="text" id="name" name="name" defaultValue="Nama Kasir" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="email" className="block text-lg font-semibold text-gray-700 mb-2">Alamat Email</label>
                <input type="email" id="email" name="email" defaultValue="kasir@fashionpark.com" readOnly className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed" />
              </div>

              <h3 className="text-xl font-bold text-gray-800 pt-4 border-t mt-8">Ubah Password</h3>
              <div>
                <label htmlFor="current_password" className="block text-lg font-semibold text-gray-700 mb-2">Password Saat Ini</label>
                <input type="password" id="current_password" name="current_password" className="w-full p-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label htmlFor="new_password" className="block text-lg font-semibold text-gray-700 mb-2">Password Baru</label>
                <input type="password" id="new_password" name="new_password" className="w-full p-3 border border-gray-300 rounded-lg" />
              </div>

              <div className="flex justify-start pt-6">
                <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center gap-2 text-lg">
                  <FaSave />
                  Simpan Perubahan
                </button>
              </div>

              {/* Tombol Ubah Foto Profil */}
              <button className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 mb-4" disabled>
                Ubah Foto Profil (belum tersedia)
              </button>
            </form>
          </div>
        </div>

        {/* Kolom Kanan - Foto & Logout */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
            <FaUserCircle className="text-9xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800">Nama Kasir</h3>
            <p className="text-gray-500 mb-6">Kasir</p>
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

export default AkunSayaKasir; 