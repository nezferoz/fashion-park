import React, { useState, useEffect } from 'react';
import { FaFileInvoiceDollar, FaRegChartBar, FaCashRegister, FaBalanceScale } from 'react-icons/fa';
import api from '../../utils/api';

const StatCard = ({ icon, title, value, loading }) => (
  <div className="bg-white p-6 rounded-2xl shadow-lg">
    <div className="flex items-center">
      <div className="bg-blue-100 p-4 rounded-full mr-4">{icon}</div>
      <div>
        <p className="text-gray-500 font-semibold">{title}</p>
        {loading ? (
          <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
        ) : (
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        )}
      </div>
    </div>
  </div>
);

const LaporanKeuangan = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [financialData, setFinancialData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    grossProfit: 0,
    netProfit: 0,
    transactions: []
  });

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/reports/finance-summary');
        setFinancialData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching financial data:', err);
        setError('Gagal memuat data keuangan');
      } finally {
        setLoading(false);
      }
    };
    fetchFinancialData();
  }, []);

  const formatCurrency = (amount) => {
    const n = Number(amount);
    if (!n || isNaN(n) || n === 0) return 'Rp 0';
    return `Rp ${n.toLocaleString('id-ID', { minimumFractionDigits: 0 })}`;
  };

  const formatLargeCurrency = (amount) => {
    const n = Number(amount);
    if (!n || isNaN(n) || n === 0) return 'Rp 0';
    if (n >= 1000000000) {
      return `Rp ${(n / 1000000000).toFixed(1)}M`;
    } else if (n >= 1000000) {
      return `Rp ${(n / 1000000).toFixed(1)}M`;
    } else if (n >= 1000) {
      return `Rp ${(n / 1000).toFixed(1)}K`;
    }
    return formatCurrency(n);
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data keuangan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Laporan Keuangan</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={<FaFileInvoiceDollar className="text-blue-600 text-2xl" />}
          title="Total Pemasukan"
          value={formatLargeCurrency(financialData.totalIncome)}
          loading={loading}
        />
        <StatCard 
          icon={<FaRegChartBar className="text-blue-600 text-2xl" />}
          title="Total Pengeluaran"
          value={formatLargeCurrency(financialData.totalExpenses)}
          loading={loading}
        />
        <StatCard 
          icon={<FaCashRegister className="text-blue-600 text-2xl" />}
          title="Laba Kotor"
          value={formatLargeCurrency(financialData.grossProfit)}
          loading={loading}
        />
        <StatCard 
          icon={<FaBalanceScale className="text-blue-600 text-2xl" />}
          title="Laba Bersih (Nett)"
          value={formatLargeCurrency(financialData.netProfit)}
          loading={loading}
        />
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Laporan Laba Rugi ({new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 font-semibold">Deskripsi</th>
                <th className="p-4 font-semibold text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-4 font-medium text-gray-800">Pendapatan Penjualan</td>
                <td className="p-4 text-right text-green-600">{formatCurrency(financialData.totalIncome)}</td>
              </tr>
              <tr className="border-b">
                <td className="p-4 font-medium text-gray-800">Harga Pokok Penjualan (HPP)</td>
                <td className="p-4 text-right text-red-600">({formatCurrency(financialData.totalExpenses)})</td>
              </tr>
              <tr className="border-b bg-gray-50">
                <td className="p-4 font-bold">Laba Kotor</td>
                <td className="p-4 text-right font-bold">{formatCurrency(financialData.grossProfit)}</td>
              </tr>
              <tr className="border-b">
                <td className="p-4 pl-8 text-gray-600">Biaya Operasional</td>
                <td className="p-4 text-right text-red-600">({formatCurrency(financialData.grossProfit * 0.1)})</td>
              </tr>
              <tr className="border-b">
                <td className="p-4 pl-8 text-gray-600">Biaya Pemasaran</td>
                <td className="p-4 text-right text-red-600">({formatCurrency(financialData.grossProfit * 0.03)})</td>
              </tr>
              <tr className="border-b">
                <td className="p-4 pl-8 text-gray-600">Pajak</td>
                <td className="p-4 text-right text-red-600">({formatCurrency(financialData.grossProfit * 0.02)})</td>
              </tr>
              <tr className="bg-green-50">
                <td className="p-4 font-bold text-lg">Laba Bersih</td>
                <td className="p-4 text-right font-bold text-lg">{formatCurrency(financialData.netProfit)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Ringkasan Transaksi</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{financialData.transactions.length}</p>
            <p className="text-gray-600">Total Transaksi</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {financialData.transactions.filter(t => t.payment_status === 'Selesai').length}
            </p>
            <p className="text-gray-600">Transaksi Selesai</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">
              {financialData.transactions.filter(t => t.payment_status === 'Pending').length}
            </p>
            <p className="text-gray-600">Transaksi Pending</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaporanKeuangan; 