import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { jwtDecode } from "../../utils/jwtDecode";

function getUserId() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.userId) {
      return user.userId;
    }
    
    // Fallback: try to get user_id from JWT token
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      return decoded?.user_id;
    }
    
    return null;
  } catch {
    return null;
  }
}

const KelolaPesananKasir = () => {
  const [pesanan, setPesanan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPesanan = async () => {
      setLoading(true);
      setError("");
      const kasirId = getUserId();
      if (!kasirId) {
        setError("User tidak ditemukan");
        setLoading(false);
        return;
      }
      try {
        const res = await api.get(`/transactions/kasir`);
        setPesanan(res.data);
      } catch {
        setError("Gagal mengambil data pesanan");
      }
      setLoading(false);
    };
    fetchPesanan();
  }, []);

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 lg:py-8 flex-1">
      <div className="bg-white rounded-xl shadow p-3 sm:p-4 lg:p-6">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6">Kelola Pesanan (Kasir)</h2>
        {error && <div className="text-red-600 text-center font-semibold mb-4 text-xs sm:text-sm">{error}</div>}
        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 text-sm sm:text-base">Memuat data pesanan...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full mb-4 sm:mb-6 text-xs sm:text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-2 sm:px-4 py-2 text-left font-semibold border-b text-xs sm:text-sm">Kode Pesanan</th>
                  <th className="px-2 sm:px-4 py-2 text-left font-semibold border-b text-xs sm:text-sm hidden sm:table-cell">Pelanggan</th>
                  <th className="px-2 sm:px-4 py-2 text-left font-semibold border-b text-xs sm:text-sm">Status</th>
                  <th className="px-2 sm:px-4 py-2 text-left font-semibold border-b text-xs sm:text-sm hidden md:table-cell">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pesanan.map((p) => (
                  <tr key={p.transaction_id} className="hover:bg-gray-50 border-b">
                    <td className="px-2 sm:px-4 py-2">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[150px] lg:max-w-none">
                          {p.transaction_code}
                        </p>
                        <p className="text-xs text-gray-500 sm:hidden">
                          {p.customer_name || 'Pelanggan Offline'}
                        </p>
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 py-2 hidden sm:table-cell text-xs sm:text-sm">
                      {p.customer_name || 'Pelanggan Offline'}
                    </td>
                    <td className="px-2 sm:px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        p.payment_status === 'completed' || p.payment_status === 'Selesai' ? 'bg-green-100 text-green-800' :
                        p.payment_status === 'pending' || p.payment_status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {p.payment_status || '-'}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-2 hidden md:table-cell">
                      <button className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm underline">
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {!loading && pesanan.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <p className="text-gray-500 text-sm sm:text-base">Belum ada pesanan</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KelolaPesananKasir; 