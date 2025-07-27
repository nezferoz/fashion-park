import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const KelolaPesananPemilik = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await api.get('/transactions');
        setOrders(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Gagal memuat data pesanan');
        setOrders([]); // Set empty array instead of dummy data
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case 'Selesai': return 'bg-green-100 text-green-800';
      case 'Dikirim': return 'bg-blue-100 text-blue-800';
      case 'Dibatalkan': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleLihatDetail = (order) => {
    setSelectedOrder(order);
  };

  const handleCloseModal = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      setSelectedOrder(null);
    }
  };

  // Filter orders based on search term and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.transaction_code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || order.payment_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex-1 p-8 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data pesanan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Kelola Pesanan (Pemilik)</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Daftar Semua Pesanan</h2>
          <div className="flex items-center gap-4">
            <input 
              type="text" 
              placeholder="Cari pesanan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg"
            >
              <option value="">Semua Status</option>
              <option value="Selesai">Selesai</option>
              <option value="Dikirim">Dikirim</option>
              <option value="Pending">Pending</option>
              <option value="Dibatalkan">Dibatalkan</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 font-semibold">ID Pesanan</th>
                <th className="p-4 font-semibold">Tanggal</th>
                <th className="p-4 font-semibold">Pelanggan</th>
                <th className="p-4 font-semibold">Total</th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th className="p-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-gray-500">
                    Tidak ada pesanan ditemukan
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.transaction_id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-800">{order.transaction_code}</td>
                    <td className="p-4 text-gray-600">{new Date(order.transaction_date).toLocaleDateString('id-ID')}</td>
                    <td className="p-4 text-gray-600">{order.customer_name || 'N/A'}</td>
                    <td className="p-4 text-gray-600">Rp {order.final_amount?.toLocaleString('id-ID') || '0'}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusClass(order.payment_status)}`}>
                        {order.payment_status || 'Pending'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        className="text-blue-600 hover:underline" 
                        onClick={() => handleLihatDetail(order)}
                      >
                        Lihat Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Pesanan */}
      {selectedOrder && (
        <div className="modal-overlay fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" onClick={handleCloseModal} style={{overflow:'hidden'}}>
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Detail Pesanan</h3>
            <div className="mb-2"><b>ID Pesanan:</b> {selectedOrder.transaction_code}</div>
            <div className="mb-2"><b>Tanggal:</b> {new Date(selectedOrder.transaction_date).toLocaleDateString('id-ID')}</div>
            <div className="mb-2"><b>Pelanggan:</b> {selectedOrder.customer_name || 'N/A'}</div>
            <div className="mb-2"><b>Total:</b> Rp {selectedOrder.final_amount?.toLocaleString('id-ID') || '0'}</div>
            <div className="mb-2"><b>Status:</b> {selectedOrder.payment_status || 'Pending'}</div>
            {selectedOrder.cashier_name && (
              <div className="mb-2"><b>Kasir:</b> {selectedOrder.cashier_name}</div>
            )}
            <button 
              className="mt-6 bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition" 
              onClick={() => setSelectedOrder(null)}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KelolaPesananPemilik; 