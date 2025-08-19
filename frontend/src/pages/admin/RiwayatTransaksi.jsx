import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight, FaPrint } from "react-icons/fa";

const RiwayatTransaksi = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalTransactions: 0,
    averagePerTransaction: 0
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWebTransactions = async () => {
      setLoading(true);
      setError("");
      try {
        // Ambil transaksi yang hanya dari web (bukan dari kasir)
        const res = await api.get("/transactions/web-only");
        const data = res.data || [];
        
        // Filter hanya transaksi dengan payment_status SUCCESS
        const successTransactions = data.filter(t => t.payment_status === 'SUCCESS');
        setTransactions(successTransactions);
        
        // Hitung summary dari transaksi SUCCESS saja
        const totalSales = successTransactions.reduce((sum, trx) => sum + Number(trx.final_amount || 0), 0);
        const totalTransactions = successTransactions.length;
        const averagePerTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0;
        
        setSummary({
          totalSales,
          totalTransactions,
          averagePerTransaction
        });
      } catch (err) {
        console.error("Error fetching web transactions:", err);
        setError("Gagal mengambil data riwayat transaksi web");
      }
      setLoading(false);
    };
    fetchWebTransactions();
  }, []);

  // Filter transactions based on search and date
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.transaction_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !selectedDate || 
                       (transaction.transaction_date && 
                        transaction.transaction_date.startsWith(selectedDate));
    
    return matchesSearch && matchesDate;
  });

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Get item count for a transaction (this would need to be calculated from transaction details)
  const getItemCount = (transaction) => {
    // Use the actual item_count from the API response
    if (transaction.item_count && transaction.item_count > 0) {
      return `${transaction.item_count} item`;
    }
    
    // Fallback: estimate based on transaction amount if item_count is not available
    const amount = Number(transaction.final_amount || 0);
    if (amount > 1000000) return "5-10 item";
    if (amount > 500000) return "3-5 item";
    if (amount > 100000) return "1-3 item";
    return "1 item";
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return 'Rp 0';
    return `Rp ${Number(amount).toLocaleString('id-ID')}`;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'paid': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'failed': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800',
      'processing': 'bg-blue-100 text-blue-800'
    };
    const className = statusMap[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
        {status || 'Pending'}
      </span>
    );
  };

  const getPaymentMethodBadge = (method) => {
    const methodMap = {
      'transfer': 'bg-purple-100 text-purple-800',
      'qris': 'bg-green-100 text-green-800',
      'midtrans': 'bg-orange-100 text-orange-800',
      'bank_transfer': 'bg-blue-100 text-blue-800',
      'gopay': 'bg-green-100 text-green-800',
      'shopeepay': 'bg-orange-100 text-orange-800'
    };
    const className = methodMap[method?.toLowerCase()] || 'bg-gray-100 text-gray-800';
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
        {method || 'Online Payment'}
      </span>
    );
  };

  const handlePrint = (transaction) => {
    // Implement print functionality
    console.log('Printing transaction:', transaction.transaction_code);
    alert('Fitur cetak akan segera tersedia');
  };

  return (
    <div className="container mx-auto px-4 py-12 flex-1">
      <div className="bg-white rounded-xl shadow p-8">
        <h2 className="text-3xl font-bold mb-6">Riwayat Transaksi Web</h2>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Total Penjualan Web</h3>
            <p className="text-2xl font-bold text-blue-900">{formatCurrency(summary.totalSales)}</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Jumlah Transaksi Web</h3>
            <p className="text-2xl font-bold text-green-900">{summary.totalTransactions}</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-800 mb-2">Rata-rata per Transaksi</h3>
            <p className="text-2xl font-bold text-purple-900">{formatCurrency(summary.averagePerTransaction)}</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Cari ID Transaksi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:w-48">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-center font-semibold mb-4">
            {error}
            <div className="text-xs text-gray-500 mt-1">
              Pastikan server backend berjalan dan Anda memiliki akses yang benar.
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Memuat data...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">No</th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Tanggal</th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Kode Pesanan</th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Pelanggan</th>
                    <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700">Jumlah Item</th>
                    <th className="border border-gray-200 px-4 py-3 text-right text-sm font-semibold text-gray-700">Total</th>
                    <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                    <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700">Metode</th>
                    <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTransactions.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="border border-gray-200 px-4 py-8 text-center text-gray-500">
                        Belum ada data transaksi web
                      </td>
                    </tr>
                  ) : (
                    currentTransactions.map((transaction, index) => (
                      <tr key={transaction.transaction_id} className="hover:bg-gray-50">
                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">
                          {indexOfFirstItem + index + 1}
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">
                          {formatDate(transaction.transaction_date)}
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-sm font-medium text-blue-600">
                          {transaction.transaction_code || '-'}
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">
                          {transaction.customer_name || transaction.customer?.name || '-'}
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900 text-center">
                          {getItemCount(transaction)}
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                          {formatCurrency(transaction.final_amount)}
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-center">
                          {getStatusBadge(transaction.payment_status)}
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-center">
                          {getPaymentMethodBadge(transaction.payment_method)}
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-center">
                          <div className="flex space-x-2 justify-center">
                            <button 
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded bg-blue-100 hover:bg-blue-200 transition"
                              onClick={() => navigate(`/admin/pesanan/${transaction.transaction_id}`)}
                            >
                              Detail
                            </button>
                            <button 
                              className="text-green-600 hover:text-green-800 text-sm font-medium px-3 py-1 rounded bg-green-100 hover:bg-green-200 transition flex items-center gap-1"
                              onClick={() => handlePrint(transaction)}
                            >
                              <FaPrint /> Cetak
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-700">
                  Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredTransactions.length)} dari {filteredTransactions.length} transaksi
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <FaChevronLeft /> Sebelumnya
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => paginate(pageNum)}
                        className={`px-3 py-2 border rounded-lg text-sm font-medium ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    Selanjutnya <FaChevronRight />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RiwayatTransaksi; 