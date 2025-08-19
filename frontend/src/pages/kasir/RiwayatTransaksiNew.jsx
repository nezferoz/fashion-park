import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { getImageUrl } from "../../utils/imageUtils";

function getUserId() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.userId || user?.user_id;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
}

const RiwayatTransaksiNew = () => {
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState({});

  useEffect(() => {
    const fetchRiwayat = async () => {
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
        console.log('Fetched transactions:', res.data);
        setRiwayat(res.data);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError("Gagal mengambil riwayat transaksi");
      }
      setLoading(false);
    };
    fetchRiwayat();
  }, []);

  // Filter riwayat berdasarkan search term dan tanggal
  const filteredRiwayat = riwayat.filter(trx => {
    const matchesSearch = !searchTerm || 
      trx.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trx.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trx.total_amount?.toString().includes(searchTerm) ||
      trx.final_amount?.toString().includes(searchTerm);
    
    const matchesDate = !selectedDate || (() => {
      if (!trx.transaction_date) return false;
      try {
        const dbDate = new Date(trx.transaction_date);
        const localDateString = dbDate.toLocaleDateString('en-CA'); // Format: YYYY-MM-DD
        return localDateString === selectedDate;
      } catch (error) {
        return false;
      }
    })();
    
    return matchesSearch && matchesDate;
  });

  // Fetch transaction details including products
  const fetchTransactionDetails = async (transactionId) => {
    if (transactionDetails[transactionId]) return; // Already loaded
    
    setLoadingDetails(prev => ({ ...prev, [transactionId]: true }));
    try {
      const res = await api.get(`/transactions/${transactionId}/details`);
      setTransactionDetails(prev => ({ 
        ...prev, 
        [transactionId]: res.data 
      }));
    } catch (err) {
      console.error('Error fetching transaction details:', err);
    } finally {
      setLoadingDetails(prev => ({ ...prev, [transactionId]: false }));
    }
  };

  // Format currency
  const formatRupiah = (amount) => {
    return `Rp${Number(amount).toLocaleString('id-ID')}`;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const handleViewDetails = (transaction) => {
    fetchTransactionDetails(transaction.transaction_id);
    setSelectedTransaction(transaction);
    setShowDetails(true);
  };

  const handlePrintReceipt = (transaction) => {
    // Implementasi print receipt
    console.log('Print receipt for transaction:', transaction.transaction_id);
    // Bisa ditambahkan logika print di sini
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedTransaction(null);
  };

  // Get today's date in YYYY-MM-DD format for date input
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <div className="container mx-auto px-4 py-8 flex-1">
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold mb-6">Riwayat Transaksi Kasir (NEW VERSION)</h2>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">🔍 Pencarian & Filter</h3>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-blue-700 mb-2">Cari Transaksi:</label>
              <input
                type="text"
                placeholder="ID transaksi, nama pelanggan, atau jumlah..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">Filter Tanggal:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={getTodayDate()}
                className="px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedDate("");
                }}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                🔄 Reset Filter
              </button>
            </div>
          </div>
          {searchTerm || selectedDate ? (
            <div className="mt-3 text-sm text-blue-600">
              Filter aktif: {searchTerm && `Search: "${searchTerm}"`} {searchTerm && selectedDate && ' • '} {selectedDate && `Tanggal: ${selectedDate}`}
            </div>
          ) : null}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat riwayat transaksi...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-700">ID Transaksi</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Tanggal</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Pelanggan</th>
                    <th className="text-center p-4 font-semibold text-gray-700">🖼️ Gambar</th>
                    <th className="text-center p-4 font-semibold text-gray-700">📏 Ukuran</th>
                    <th className="text-center p-4 font-semibold text-gray-700">💰 Total</th>
                    <th className="text-center p-4 font-semibold text-gray-700">📊 Status</th>
                    <th className="text-center p-4 font-semibold text-gray-700">⚡ Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRiwayat.map((trx) => (
                    <tr key={trx.transaction_id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="p-4">
                        <span className="font-medium text-gray-900 text-lg">
                          #{trx.transaction_id}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-600 font-medium">
                          {formatDate(trx.transaction_date)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-gray-900 bg-blue-100 px-2 py-1 rounded-full text-sm">
                          {trx.customer_name || 'Pelanggan Offline'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {trx.main_image_id ? (
                          <img
                            src={getImageUrl(trx.main_image_id)}
                            alt="Product"
                            className="w-16 h-16 object-cover rounded-lg mx-auto border-2 border-gray-200 shadow-sm"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto flex items-center justify-center border-2 border-gray-300">
                            <span className="text-gray-400 text-xs font-medium">No Image</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          {trx.size || 'N/A'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="font-bold text-lg text-green-600">
                          {formatRupiah(trx.final_amount || trx.total_amount)}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                          {trx.payment_status || '-'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleViewDetails(trx)}
                            className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg"
                            title="Lihat Detail"
                          >
                            👁️ Detail
                          </button>
                          <button
                            onClick={() => handlePrintReceipt(trx)}
                            className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition-colors shadow-md hover:shadow-lg"
                            title="Cetak Struk"
                          >
                            🖨️ Print
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredRiwayat.length === 0 && !loading && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500 text-lg">
              {searchTerm || selectedDate ? 'Tidak ada transaksi yang sesuai dengan filter' : 'Belum ada transaksi'}
            </p>
            {searchTerm || selectedDate ? (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedDate("");
                }}
                className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Hapus Filter
              </button>
            ) : null}
          </div>
        )}

        {/* Transaction Details Modal */}
        {showDetails && selectedTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 bg-blue-50">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-blue-900">📋 Detail Transaksi</h3>
                  <button
                    onClick={closeDetails}
                    className="text-blue-400 hover:text-blue-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                    ℹ️ Informasi Transaksi
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">ID Transaksi:</span>
                      <span className="font-bold text-blue-600">#{selectedTransaction.transaction_id}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Tanggal:</span>
                      <span className="font-medium">{formatDate(selectedTransaction.transaction_date)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Pelanggan:</span>
                      <span className="font-medium bg-blue-100 px-2 py-1 rounded-full text-sm">
                        {selectedTransaction.customer_name || 'Pelanggan Offline'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Total:</span>
                      <span className="font-bold text-lg text-green-600">
                        {formatRupiah(selectedTransaction.final_amount || selectedTransaction.total_amount)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                    🛍️ Produk yang Dibeli
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-3">
                      {transactionDetails[selectedTransaction.transaction_id] ? (
                        transactionDetails[selectedTransaction.transaction_id].map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{item.product_name}</p>
                              <p className="text-gray-500 text-sm">
                                {item.size && `📏 Ukuran: ${item.size}`} • 📦 Qty: {item.quantity}
                              </p>
                            </div>
                            <p className="font-semibold text-gray-900 ml-4 text-lg">
                              {formatRupiah(item.price * item.quantity)}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          {loadingDetails[selectedTransaction.transaction_id] ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                          ) : (
                            <div>
                              <div className="text-4xl mb-2">📦</div>
                              <p className="text-gray-500">Detail produk tidak tersedia</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiwayatTransaksiNew;
