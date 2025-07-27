import React, { useState, useEffect } from 'react';
import { FaDollarSign, FaChartLine, FaUsers, FaShoppingCart } from 'react-icons/fa';
import api from '../../utils/api';

const StatCard = ({ icon, title, value, change, changeType, loading }) => {
  const isPositive = changeType === 'positive';
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center">
        <div className="bg-blue-100 p-4 rounded-full mr-4">
          {icon}
        </div>
        <div>
          <p className="text-gray-500 font-semibold">{title}</p>
          {loading ? (
            <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
          ) : (
            <p className="text-3xl font-bold text-gray-800">{value}</p>
          )}
        </div>
      </div>
      {!loading && (
        <div className="mt-4">
          <span className={`font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {change}
          </span>
          <span className="text-gray-500"> vs bulan lalu</span>
        </div>
      )}
    </div>
  );
};

const DashboardKPI = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kpiData, setKpiData] = useState({
    totalRevenue: 0,
    netProfit: 0,
    newCustomers: 0,
    averageTransactionValue: 0,
    totalTransactions: 0,
    totalProducts: 0,
    totalUsers: 0,
    conversionRate: 0,
    customerAcquisitionCost: 0,
    retentionRate: 0,
    topProduct: 'N/A'
  });

  useEffect(() => {
    const fetchKPIData = async () => {
      try {
        setLoading(true);
        
        // Fetch all necessary data
        const [transactionsRes, productsRes, usersRes] = await Promise.all([
          api.get('/transactions'),
          api.get('/products'),
          api.get('/users')
        ]);

        const transactions = transactionsRes.data;
        const products = productsRes.data;
        const users = usersRes.data;

        // Calculate KPIs with type safety
        const totalRevenue = transactions.reduce((sum, t) => sum + Number(t.final_amount || 0), 0);
        const netProfit = !isNaN(totalRevenue) ? totalRevenue * 0.4 : 0; // Assuming 40% profit margin
        const newCustomers = users.filter(u => u.role === 'customer').length;
        const averageTransactionValue = transactions.length > 0 ? totalRevenue / transactions.length : 0;
        
        // Calculate conversion rate (transactions / total users)
        const conversionRate = users.length > 0 ? (transactions.length / users.length) * 100 : 0;
        
        // Estimate customer acquisition cost (marketing budget / new customers)
        const customerAcquisitionCost = newCustomers > 0 ? 5000000 / newCustomers : 0;
        
        // Estimate retention rate (repeat customers / total customers)
        const retentionRate = 45; // This would need more complex calculation
        
        // Find top product (this would need transaction details in a real system)
        const topProduct = products.length > 0 ? products[0].product_name : 'N/A';

        setKpiData({
          totalRevenue: isNaN(totalRevenue) ? 0 : totalRevenue,
          netProfit: isNaN(netProfit) ? 0 : netProfit,
          newCustomers,
          averageTransactionValue: isNaN(averageTransactionValue) ? 0 : averageTransactionValue,
          totalTransactions: transactions.length,
          totalProducts: products.length,
          totalUsers: users.length,
          conversionRate: isNaN(conversionRate) ? 0 : conversionRate,
          customerAcquisitionCost: isNaN(customerAcquisitionCost) ? 0 : customerAcquisitionCost,
          retentionRate,
          topProduct
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching KPI data:', err);
        setError('Gagal memuat data KPI');
      } finally {
        setLoading(false);
      }
    };

    fetchKPIData();
  }, []);

  const formatCurrency = (amount) => {
    const n = Number(amount);
    if (!n || isNaN(n) || n === 0) return 'Rp 0';
    if (n >= 1000000000) {
      return `Rp ${(n / 1000000000).toFixed(1)}M`;
    } else if (n >= 1000000) {
      return `Rp ${(n / 1000000).toFixed(1)}M`;
    } else if (n >= 1000) {
      return `Rp ${(n / 1000).toFixed(1)}K`;
    }
    return `Rp ${n.toLocaleString('id-ID', { minimumFractionDigits: 0 })}`;
  };

  const formatNumber = (num) => {
    return Number(num).toLocaleString('id-ID');
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data KPI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Dashboard KPI (Pemilik)</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={<FaDollarSign className="text-blue-600 text-2xl" />}
          title="Total Pendapatan"
          value={formatCurrency(kpiData.totalRevenue)}
          change="+12.5%"
          changeType="positive"
          loading={loading}
        />
        <StatCard 
          icon={<FaChartLine className="text-blue-600 text-2xl" />}
          title="Laba Bersih"
          value={formatCurrency(kpiData.netProfit)}
          change="+8.2%"
          changeType="positive"
          loading={loading}
        />
        <StatCard 
          icon={<FaUsers className="text-blue-600 text-2xl" />}
          title="Pelanggan Baru"
          value={formatNumber(kpiData.newCustomers)}
          change="-2.1%"
          changeType="negative"
          loading={loading}
        />
        <StatCard 
          icon={<FaShoppingCart className="text-blue-600 text-2xl" />}
          title="Nilai Transaksi Rata-rata"
          value={formatCurrency(kpiData.averageTransactionValue)}
          change="+5.7%"
          changeType="positive"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kolom Kiri untuk Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Grafik Pertumbuhan Pendapatan</h2>
          <div className="h-80 bg-gray-200 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">[Placeholder untuk Grafik]</p>
          </div>
        </div>

        {/* Kolom Kanan untuk KPI lainnya */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Ringkasan Kinerja</h2>
          <ul className="space-y-4">
            <li className="flex justify-between items-center">
              <span className="font-semibold text-gray-600">Tingkat Konversi</span>
              <span className="font-bold text-lg text-gray-800">{isNaN(kpiData.conversionRate) ? 0 : kpiData.conversionRate.toFixed(1)}%</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="font-semibold text-gray-600">Biaya Akuisisi Pelanggan</span>
              <span className="font-bold text-lg text-gray-800">{formatCurrency(kpiData.customerAcquisitionCost)}</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="font-semibold text-gray-600">Tingkat Retensi</span>
              <span className="font-bold text-lg text-gray-800">{kpiData.retentionRate}%</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="font-semibold text-gray-600">Produk Terlaris</span>
              <span className="font-bold text-lg text-gray-800">{kpiData.topProduct}</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="font-semibold text-gray-600">Total Transaksi</span>
              <span className="font-bold text-lg text-gray-800">{kpiData.totalTransactions}</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="font-semibold text-gray-600">Total Produk</span>
              <span className="font-bold text-lg text-gray-800">{kpiData.totalProducts}</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="font-semibold text-gray-600">Total Pengguna</span>
              <span className="font-bold text-lg text-gray-800">{kpiData.totalUsers}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardKPI; 