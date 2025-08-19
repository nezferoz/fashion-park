import React, { useState, useEffect } from 'react';
import { FaShoppingCart, FaUsers, FaExclamationTriangle, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
} from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
);

const StatCard = ({ icon, title, value, linkTo }) => (
  <Link to={linkTo} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 block">
    <div className="flex items-center">
      <div className="bg-blue-100 p-4 rounded-full mr-4">{icon}</div>
      <div>
        <p className="text-gray-500 font-semibold">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  </Link>
);

const DashboardAdmin = () => {
  const [dashboardData, setDashboardData] = useState({
    newOrders: 0,
    totalUsers: 0,
    lowStockProducts: 0,
    recentOrders: [],
    lowStockItems: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Chart data
  const pieChartData = {
    labels: ['Pesanan Baru', 'Total User', 'Stok Hampir Habis'],
    datasets: [
      {
        data: [dashboardData.newOrders, dashboardData.totalUsers, dashboardData.lowStockProducts],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)', // Blue
          'rgba(16, 185, 129, 0.8)',  // Green
          'rgba(239, 68, 68, 0.8)',   // Red
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Statistik Dashboard',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Fetching dashboard data...');
      
      // Fetch dashboard statistics
      const [ordersRes, usersRes, productsRes] = await Promise.all([
        api.get('/transactions/dashboard-stats'),
        api.get('/users/count'),
        api.get('/products/low-stock')
      ]);

      console.log('Orders response:', ordersRes.data);
      console.log('Users response:', usersRes.data);
      console.log('Products response:', productsRes.data);

      const dashboardDataNew = {
        newOrders: ordersRes.data.newOrders || 0,
        totalUsers: usersRes.data.count || 0,
        lowStockProducts: productsRes.data.count || 0,
        recentOrders: ordersRes.data.recentOrders || [],
        lowStockItems: productsRes.data.products || []
      };

      console.log('Processed dashboard data:', dashboardDataNew);
      setDashboardData(dashboardDataNew);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (amount) => {
    return `Rp ${Number(amount).toLocaleString('id-ID')}`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'baru':
      case 'new':
        return 'bg-green-100 text-green-800';
      case 'dikemas':
      case 'packaged':
        return 'bg-yellow-100 text-yellow-800';
      case 'dikirim':
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'selesai':
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 bg-gray-50">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-600">Memuat data dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8 bg-gray-50">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Dashboard Admin</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard 
          icon={<FaShoppingCart className="text-blue-600 text-2xl" />}
          title="Pesanan Baru"
          value={dashboardData.newOrders}
          linkTo="/admin/pesanan"
        />
        <StatCard 
          icon={<FaUsers className="text-blue-600 text-2xl" />}
          title="Total User"
          value={dashboardData.totalUsers}
          linkTo="/admin/user"
        />
        <StatCard 
          icon={<FaExclamationTriangle className="text-red-500 text-2xl" />}
          title="Stok Hampir Habis"
          value={`${dashboardData.lowStockProducts} Produk`}
          linkTo="/kasir/stok"
        />
      </div>

      {/* Grafik Lingkaran */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Statistik Dashboard</h2>
        <div className="flex justify-center">
          <div style={{ width: '400px', height: '400px' }}>
            <Pie data={pieChartData} options={pieChartOptions} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pesanan Terbaru */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Pesanan Terbaru</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-2">ID Pesanan</th>
                  <th className="py-2">Pelanggan</th>
                  <th className="py-2">Total</th>
                  <th className="py-2">Status</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentOrders.length > 0 ? (
                  dashboardData.recentOrders.map(order => (
                    <tr key={order.transaction_id} className="border-b">
                      <td className="py-3 font-medium">{order.transaction_code}</td>
                      <td className="py-3">{order.customer_name || 'Cash'}</td>
                      <td className="py-3">{formatRupiah(order.final_amount)}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.payment_status)}`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="py-3">
                        <Link to={`/admin/pesanan/${order.transaction_id}`} className="text-blue-600 hover:underline">Detail</Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-4 text-center text-gray-500">
                      Belum ada pesanan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stok Rendah */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Produk Stok Rendah</h2>
          <ul className="space-y-3">
            {dashboardData.lowStockItems.length > 0 ? (
              dashboardData.lowStockItems.map(product => (
                <li key={product.product_id} className="flex justify-between items-center">
                  <span className="text-sm">{product.product_name}</span>
                  <span className="font-bold text-red-600 text-sm">{product.total_stock} pcs</span>
                </li>
              ))
            ) : (
              <li className="text-center text-gray-500 text-sm">
                Tidak ada produk dengan stok rendah
              </li>
            )}
          </ul>
          <Link to="/kasir/stok" className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all w-full block text-center">
            Lihat Semua <FaArrowRight className="inline ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin; 