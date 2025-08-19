import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import api from "../../utils/api";
import { FaUser, FaClipboardList, FaHistory, FaBars, FaTimes } from 'react-icons/fa';

const RiwayatBelanja = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchRiwayat();
    }
  }, [user]);

  const fetchRiwayat = async () => {
    setLoading(true);
    setError("");
    
    if (!user?.userId) {
      setError("User tidak ditemukan");
      setLoading(false);
      return;
    }
    
    try {
      const res = await api.get(`/transactions?user_id=${user.userId}`);
      
      // Filter hanya transaksi dengan payment_status SUCCESS
      const successTransactions = res.data.filter(t => t.payment_status === 'SUCCESS');
      setRiwayat(successTransactions);
    } catch {
      setError("Gagal mengambil riwayat belanja");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row">
        {/* Mobile Header */}
        <div className="lg:hidden bg-blue-600 text-white p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Fashion Park</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white p-2"
          >
            {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}></div>
            <div className="fixed left-0 top-0 h-full w-64 bg-blue-600 text-white shadow-lg">
              {/* Mobile Sidebar Content */}
              <div className="flex items-center justify-between h-16 px-6 font-bold text-xl tracking-tight border-b border-blue-700 bg-blue-600">
                <span className="text-white">Fashion Park</span>
                <button onClick={() => setSidebarOpen(false)} className="text-white p-2">
                  <FaTimes size={20} />
                </button>
              </div>
              
              <nav className="flex-1 flex flex-col gap-2 px-4 py-6 bg-blue-600">
                <button
                  onClick={() => { navigate('/pelanggan/profile'); setSidebarOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-150 border-l-4 text-white hover:bg-blue-700"
                >
                  <FaUser className="text-lg" />
                  <span>Akun</span>
                </button>
                <button
                  onClick={() => { navigate('/pelanggan/status-pesanan'); setSidebarOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-150 border-l-4 text-white hover:bg-blue-700"
                >
                  <FaClipboardList className="text-lg" />
                  <span>Pesanan</span>
                </button>
                <button
                  onClick={() => { navigate('/pelanggan/riwayat'); setSidebarOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all duration-150 border-l-4 bg-white text-blue-600 border-blue-700 hover:bg-gray-50"
                >
                  <FaHistory className="text-lg text-blue-600" />
                  <span className="text-blue-600">Riwayat Belanja</span>
                </button>
                
                {/* Tombol Kembali di Mobile Sidebar */}
                <div className="mt-6 pt-6 border-t border-blue-700">
                  <button
                    onClick={() => { navigate('/'); setSidebarOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-150 border-l-4 text-white hover:bg-blue-700 w-full"
                  >
                    <span className="text-xl">←</span>
                    <span>Kembali ke Beranda</span>
                  </button>
                </div>
              </nav>
              
              {/* User Info di Mobile Sidebar */}
              <div className="px-4 py-4 border-t border-blue-700 bg-blue-600">
                <span className="block text-sm font-semibold text-white">{user?.name || 'pelanggan'} (pelanggan)</span>
              </div>
            </div>
          </div>
        )}

        {/* Sidebar - Desktop */}
        <div className="hidden lg:block w-64 bg-blue-600 text-white flex flex-col shadow-lg min-h-screen">
          {/* Header */}
          <div className="flex items-center h-16 px-6 font-bold text-2xl tracking-tight border-b border-blue-700 bg-blue-600 flex-shrink-0">
            <span className="text-white">Fashion Park</span>
          </div>
          
          {/* Navigation Menu */}
          <nav className="flex-1 flex flex-col gap-2 px-4 py-6 bg-blue-600 min-h-0">
                         <button
               onClick={() => navigate('/pelanggan/profile')}
               className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-150 border-l-4 text-white hover:bg-blue-700"
             >
               <FaUser className="text-lg" />
               <span>Akun</span>
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
              className="flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all duration-150 border-l-4 bg-white text-blue-600 border-blue-700 hover:bg-gray-50"
            >
              <FaHistory className="text-lg text-blue-600" />
              <span className="text-blue-600">Riwayat Belanja</span>
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
            <span className="block text-sm font-semibold text-white">{user?.name || 'pelanggan'} (pelanggan)</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-3 sm:p-4 lg:p-4 overflow-y-auto bg-gray-50">
          <div className="max-w-6xl mx-auto">
            
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Riwayat Belanja</h2>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Memuat riwayat belanja...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">❌</div>
                  <p className="text-red-500 text-lg">{error}</p>
                </div>
              ) : riwayat.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📦</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Belum ada riwayat belanja</h3>
                  <p className="text-gray-600 mb-6">Mulai berbelanja untuk melihat riwayat di sini</p>
                  <button
                    onClick={() => navigate('/katalog')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Mulai Belanja
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-gray-900 text-sm sm:text-lg">Tanggal</th>
                        <th className="text-right py-3 sm:py-4 px-2 sm:px-4 font-semibold text-gray-900 text-sm sm:text-lg">Total</th>
                        <th className="text-center py-3 sm:py-4 px-2 sm:px-4 font-semibold text-gray-900 text-sm sm:text-lg">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {riwayat.map((trx) => (
                        <tr key={trx.transaction_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3 sm:py-4 px-2 sm:px-4 text-gray-700 text-sm sm:text-base">
                            {trx.transaction_date ? new Date(trx.transaction_date).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : '-'}
                          </td>
                          <td className="py-3 sm:py-4 px-2 sm:px-4 text-right font-semibold text-blue-600 text-base sm:text-lg">
                            Rp{Number(trx.total_amount || 0).toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 sm:py-4 px-2 sm:px-4 text-center">
                            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                              trx.payment_status === 'success' ? 'bg-green-100 text-green-800' :
                              trx.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              trx.payment_status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {trx.payment_status === 'success' ? 'Berhasil' :
                               trx.payment_status === 'pending' ? 'Menunggu' :
                               trx.payment_status === 'failed' ? 'Gagal' :
                               trx.status || 'Unknown'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiwayatBelanja; 