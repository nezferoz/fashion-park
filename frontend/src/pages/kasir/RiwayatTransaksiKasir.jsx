import React, { useEffect, useState } from 'react';
import { FaPrint, FaSearch } from 'react-icons/fa';
import api from '../../utils/api';

function getUserId() {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.user_id;
  } catch {
    return null;
  }
}

const RiwayatTransaksiKasir = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError("");
      const kasirId = getUserId();
      if (!kasirId) {
        setError("User tidak ditemukan");
        setLoading(false);
        return;
      }
      try {
        const res = await api.get(`/transactions?kasir_id=${kasirId}`);
        setTransactions(res.data);
      } catch {
        setError("Gagal mengambil data transaksi");
      }
      setLoading(false);
    };
    fetchTransactions();
  }, []);

  return (
    <div className="flex-1 p-8 bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Riwayat Transaksi Saya</h1>
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Transaksi Tercatat</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Cari ID Transaksi..."
                className="w-64 p-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <input 
              type="date"
              className="p-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
        {error && <div className="text-red-600 text-center font-semibold mb-4">{error}</div>}
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4 font-semibold">ID Transaksi</th>
                  <th className="p-4 font-semibold">Tanggal & Waktu</th>
                  <th className="p-4 font-semibold text-center">Jumlah Item</th>
                  <th className="p-4 font-semibold text-right">Total</th>
                  <th className="p-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(trx => (
                  <tr key={trx.transaction_id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-800">{trx.transaction_code}</td>
                    <td className="p-4 text-gray-600">{trx.transaction_date}</td>
                    <td className="p-4 text-center text-gray-600">{trx.total_items || '-'}</td>
                    <td className="p-4 text-right text-gray-800 font-semibold">Rp{Number(trx.total_amount).toLocaleString()}</td>
                    <td className="p-4 text-center">
                      <button className="text-blue-600 hover:underline flex items-center gap-1 mx-auto">
                        <FaPrint />
                        Cetak Ulang
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiwayatTransaksiKasir; 