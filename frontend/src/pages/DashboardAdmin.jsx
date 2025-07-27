import React from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaBoxOpen, FaUsers, FaExclamationTriangle, FaArrowRight } from 'react-icons/fa';

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
  // Dummy data
  const recentOrders = [
    { id: 'ORD-128', customer: 'Rina S.', total: 'Rp 450.000', status: 'Baru' },
    { id: 'ORD-127', customer: 'Andi P.', total: 'Rp 1.200.000', status: 'Dikemas' },
    { id: 'ORD-126', customer: 'Sari W.', total: 'Rp 300.000', status: 'Dikirim' },
  ];

  const lowStockProducts = [
    { name: 'Kemeja Lengan Panjang', stock: 5 },
    { name: 'Celana Chino Hitam', stock: 3 },
    { name: 'Topi Baseball', stock: 8 },
  ];

  return (
    <div className="flex-1 p-8 bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Dashboard Admin</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard 
          icon={<FaShoppingCart className="text-blue-600 text-2xl" />}
          title="Pesanan Baru"
          value="15"
          linkTo="/admin/pesanan"
        />
        <StatCard 
          icon={<FaUsers className="text-blue-600 text-2xl" />}
          title="Total User"
          value="45"
          linkTo="/admin/user"
        />
        <StatCard 
          icon={<FaExclamationTriangle className="text-red-500 text-2xl" />}
          title="Stok Hampir Habis"
          value="12 Produk"
          linkTo="/admin/stok"
        />
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
                {recentOrders.map(order => (
                  <tr key={order.id} className="border-b">
                    <td className="py-3 font-medium">{order.id}</td>
                    <td className="py-3">{order.customer}</td>
                    <td className="py-3">{order.total}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 text-sm font-semibold rounded-full ${order.status === 'Baru' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <Link to="/admin/pesanan" className="text-blue-600 hover:underline">Detail</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stok Rendah */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Produk Stok Rendah</h2>
          <ul className="space-y-3">
            {lowStockProducts.map(product => (
              <li key={product.name} className="flex justify-between items-center">
                <span>{product.name}</span>
                <span className="font-bold text-red-600">{product.stock} pcs</span>
              </li>
            ))}
          </ul>
          <Link to="/admin/stok" className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all w-full block text-center">
            Lihat Semua <FaArrowRight className="inline ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin; 