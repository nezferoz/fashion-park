import React, { useState, useEffect } from 'react';
import { FaDollarSign, FaUsers, FaShoppingCart, FaChartBar } from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import api from '../../utils/api';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchKPIData = async () => {
      try {
        setLoading(true);
        
        // Fetch KPI data from the new endpoint
        const kpiRes = await api.get('/transactions/kpi');
        const kpiData = kpiRes.data;
        
        console.log('📊 KPI Data received:', kpiData);

        setKpiData({
          totalRevenue: kpiData.totalRevenue || 0,
          currentMonthRevenue: kpiData.currentMonthRevenue || 0,
          lastMonthRevenue: kpiData.lastMonthRevenue || 0,
          revenueChange: kpiData.revenueChange || 0,
          newCustomers: kpiData.newCustomers || 0,
          averageTransactionValue: kpiData.averageTransactionValue || 0,
          averageTransactionChange: kpiData.averageTransactionChange || 0,
          totalTransactions: kpiData.totalTransactions || 0,
          currentMonthTransactionsCount: kpiData.currentMonthTransactionsCount || 0,
          lastMonthTransactionsCount: kpiData.lastMonthTransactionsCount || 0,
          transactionChange: kpiData.transactionChange || 0,
          totalProducts: kpiData.totalProducts || 0,
          totalUsers: kpiData.totalUsers || 0,
          conversionRate: kpiData.conversionRate || 0,
          customerAcquisitionCost: kpiData.customerAcquisitionCost || 0,
          retentionRate: kpiData.retentionRate || 0,
          topProduct: kpiData.topProduct || 'N/A'
        });

        setChartData({
          labels: kpiData.chartLabels || [],
          datasets: [
            {
              label: 'Pendapatan Harian',
              data: kpiData.chartRevenueData || [],
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4,
              fill: true
            }
          ]
        });

        setError(null);
      } catch (err) {
        console.error('Error fetching KPI data:', err);
        setError('Gagal memuat data KPI');
        
        // Set default values if API fails
        setKpiData({
          totalRevenue: 0,
          currentMonthRevenue: 0,
          lastMonthRevenue: 0,
          revenueChange: 0,
          newCustomers: 0,
          averageTransactionValue: 0,
          averageTransactionChange: 0,
          totalTransactions: 0,
          currentMonthTransactionsCount: 0,
          lastMonthTransactionsCount: 0,
          transactionChange: 0,
          totalProducts: 0,
          totalUsers: 0,
          conversionRate: 0,
          customerAcquisitionCost: 0,
          retentionRate: 0,
          topProduct: 'N/A'
        });
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
              <h1 className="text-4xl font-bold text-gray-800 mb-8">Dashboard</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatCard 
          icon={<FaDollarSign className="text-blue-600 text-2xl" />}
          title="Total Pendapatan"
          value={formatCurrency(kpiData.totalRevenue)}
          change={`${(kpiData.revenueChange || 0) >= 0 ? '+' : ''}${(kpiData.revenueChange || 0).toFixed(1)}%`}
          changeType={(kpiData.revenueChange || 0) >= 0 ? 'positive' : 'negative'}
          loading={loading}
        />
        <StatCard 
          icon={<FaShoppingCart className="text-blue-600 text-2xl" />}
          title="Nilai Transaksi Rata-rata"
          value={formatCurrency(kpiData.averageTransactionValue)}
          change={`${(kpiData.averageTransactionChange || 0) >= 0 ? '+' : ''}${(kpiData.averageTransactionChange || 0).toFixed(1)}%`}
          changeType={(kpiData.averageTransactionChange || 0) >= 0 ? 'positive' : 'negative'}
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kolom Kiri untuk Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Grafik Pertumbuhan Pendapatan</h2>
          {chartData ? (
            <Line
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                    labels: {
                      color: '#374151'
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                          label += ': ';
                        }
                        if (context.parsed.y !== null) {
                          label += formatCurrency(context.parsed.y);
                        }
                        return label;
                      }
                    }
                  },
                  title: {
                    display: true,
                    text: 'Pendapatan Harian (Rp)',
                    color: '#374151',
                    font: {
                      size: 18
                    },
                    padding: {
                      top: 10,
                      bottom: 10
                    }
                  }
                },
                scales: {
                  x: {
                    ticks: {
                      color: '#6b7280',
                      font: {
                        size: 12
                      }
                    },
                    grid: {
                      color: '#e5e7eb'
                    },
                    title: {
                      display: true,
                      text: 'Tanggal',
                      color: '#6b7280',
                      font: {
                        size: 14
                      },
                      padding: {
                        top: 10,
                        bottom: 10
                      }
                    }
                  },
                  y: {
                    ticks: {
                      color: '#6b7280',
                      font: {
                        size: 12
                      }
                    },
                    grid: {
                      color: '#e5e7eb'
                    },
                    title: {
                      display: true,
                      text: 'Pendapatan (Rp)',
                      color: '#6b7280',
                      font: {
                        size: 14
                      },
                      padding: {
                        top: 10,
                        bottom: 10
                      }
                    }
                  }
                }
              }}
            />
          ) : (
            <div className="h-80 bg-gray-200 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">[Placeholder untuk Grafik]</p>
            </div>
          )}
        </div>

        {/* Kolom Kanan untuk KPI lainnya */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Ringkasan Kinerja</h2>
          <ul className="space-y-4">
            <li className="flex justify-between items-center">
              <span className="font-semibold text-gray-600">Produk Terlaris</span>
              <span className="font-bold text-lg text-gray-800">
                {kpiData.topProduct}
                {kpiData.topProductQuantity > 0 && (
                  <span className="text-sm text-gray-500 ml-2">
                    ({kpiData.topProductQuantity} terjual)
                  </span>
                )}
              </span>
            </li>
            <li className="flex justify-between items-center">
              <span className="font-semibold text-gray-600">Total Transaksi</span>
              <span className="font-bold text-lg text-gray-800">
                {kpiData.successTransactionsCount || 0} / {kpiData.totalTransactions}
                <span className="text-sm text-gray-500 ml-2">
                  (Success / Total)
                </span>
              </span>
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