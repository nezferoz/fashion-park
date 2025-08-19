import React, { useState, useEffect } from 'react';
import { FaPrint, FaSearch, FaFileExcel } from 'react-icons/fa';
import api from '../../utils/api';

const RiwayatTransaksiPemilik = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await api.get('/transactions');
        
        // Filter hanya transaksi dengan payment_status SUCCESS
        const successTransactions = response.data.filter(t => t.payment_status === 'SUCCESS');
        setTransactions(successTransactions);
        setError(null);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Gagal memuat data transaksi');
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return 'Rp 0';
    return `Rp ${Number(amount).toLocaleString('id-ID')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter transactions based on search and date range
  const applyFilters = () => {
    const filtered = transactions.filter(transaction => {
      const matchesSearch = transaction.transaction_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.cashier_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesDate = true;
      if (startDate && endDate) {
        const transactionDate = new Date(transaction.transaction_date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        matchesDate = transactionDate >= start && transactionDate <= end;
      }
      
      return matchesSearch && matchesDate;
    });
    setFilteredTransactions(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [transactions, searchTerm, startDate, endDate]);

  const totalRevenue = filteredTransactions.reduce((sum, transaction) => {
    return sum + Number(transaction.final_amount || 0);
  }, 0);

  const exportToExcel = () => {
    // Create CSV content with proper formatting
    const headers = ['ID Transaksi', 'Tanggal', 'Waktu', 'Kasir', 'Status', 'Total (Rp)'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(transaction => {
        const date = new Date(transaction.transaction_date);
        const formattedDate = date.toLocaleDateString('id-ID', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
        const formattedTime = date.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit'
        });
        
        return [
          `"${transaction.transaction_code || ''}"`,
          `"${formattedDate}"`,
          `"${formattedTime}"`,
          `"${transaction.cashier_name || 'N/A'}"`,
          `"${transaction.payment_status || 'Pending'}"`,
          `"${(transaction.final_amount || 0).toLocaleString('id-ID')}"`
        ].join(',');
      })
    ].join('\n');

    // Add BOM for proper UTF-8 encoding
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvContent;

    // Create and download file
    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `riwayat-transaksi-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data transaksi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Riwayat Transaksi (Global)</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <input 
            type="text" 
            placeholder="Cari ID atau Kasir..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:col-span-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="md:col-span-2 flex items-center gap-2">
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg" 
            />
            <span>-</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg" 
            />
          </div>
          <button 
            onClick={applyFilters}
            className="md:col-span-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
          >
            <FaSearch />
            Filter
          </button>
        </div>

        <div className="flex justify-end mb-4">
             <button 
               onClick={exportToExcel}
               className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-all flex items-center gap-2"
             >
                <FaFileExcel />
                Export ke Excel
            </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 font-semibold">ID Transaksi</th>
                <th className="p-4 font-semibold">Tanggal & Waktu</th>
                <th className="p-4 font-semibold">Kasir</th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th className="p-4 font-semibold text-right">Total</th>
                <th className="p-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-gray-500">
                    Tidak ada transaksi ditemukan
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(transaction => (
                  <tr key={transaction.transaction_id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-800">{transaction.transaction_code}</td>
                    <td className="p-4 text-gray-600">{formatDate(transaction.transaction_date)}</td>
                    <td className="p-4 text-gray-600">{transaction.cashier_name || 'N/A'}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                        transaction.payment_status === 'Selesai' ? 'bg-green-100 text-green-800' :
                        transaction.payment_status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {transaction.payment_status || 'Pending'}
                      </span>
                    </td>
                    <td className="p-4 text-right text-gray-800 font-semibold">
                      {formatCurrency(transaction.final_amount)}
                    </td>
                    <td className="p-4 text-center">
                      <button className="text-blue-600 hover:underline">Lihat Detail</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-gray-200">
                <tr>
                    <td colSpan="4" className="p-4 text-right font-bold text-lg">Total Pendapatan (Filtered)</td>
                    <td colSpan="2" className="p-4 text-right font-bold text-lg">{formatCurrency(totalRevenue)}</td>
                </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RiwayatTransaksiPemilik; 