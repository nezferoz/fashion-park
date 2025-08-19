import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";

const KelolaPesanan = () => {
  const [pesanan, setPesanan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: "",
    waybill_number: "",
    courier: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPesanan = async () => {
      setLoading(true);
      setError("");
      try {
        // Sementara gunakan endpoint yang sudah bekerja
        const res = await api.get("/transactions");
        // Filter transaksi online tanpa kasir di frontend
        const onlineTransactions = res.data.filter(transaction => 
          ['DIGITAL', 'QRIS'].includes(transaction.payment_method) && 
          transaction.cashier_id === null
        );
        setPesanan(onlineTransactions);
      } catch {
        setError("Gagal mengambil data pesanan");
      }
      setLoading(false);
    };
    fetchPesanan();
  }, []);

  // Fungsi untuk generate label pelanggan offline
  const getCustomerLabel = (item, index) => {
    if (item.customer_name) {
      return item.customer_name;
    }
    // Hitung urutan pelanggan offline (tanpa customer_name)
    let offlineCounter = 1;
    for (let i = 0; i < index; i++) {
      if (!pesanan[i].customer_name) {
        offlineCounter++;
      }
    }
    return `pelanggankasir${offlineCounter}`;
  };

  const handleUpdateOrder = (order) => {
    setSelectedOrder(order);
    setUpdateData({
      status: order.status || "",
      waybill_number: order.waybill_number || "",
      courier: order.courier || ""
    });
    setShowUpdateModal(true);
  };

  const handleSubmitUpdate = async () => {
    try {
      await api.put(`/transactions/${selectedOrder.transaction_id}`, updateData);
      setShowUpdateModal(false);
      
      // Refresh data dengan endpoint yang sama
      const res = await api.get("/transactions");
      // Filter transaksi online tanpa kasir di frontend
      const onlineTransactions = res.data.filter(transaction => 
        ['DIGITAL', 'QRIS'].includes(transaction.payment_method) && 
        transaction.cashier_id === null
      );
      setPesanan(onlineTransactions);
      

    } catch (err) {
      alert("Gagal mengupdate pesanan");
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'menunggu pembayaran':
        return 'bg-yellow-100 text-yellow-800';
      case 'diproses':
        return 'bg-blue-100 text-blue-800';
      case 'dikirim':
        return 'bg-purple-100 text-purple-800';
      case 'selesai':
        return 'bg-green-100 text-green-800';
      case 'dibatalkan':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 flex-1">
      <div className="bg-white rounded-xl shadow p-8">
        <h2 className="text-3xl font-bold mb-6">Kelola Pesanan</h2>
        {error && <div className="text-red-600 text-center font-semibold mb-4">{error}</div>}
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <table className="w-full border-collapse border border-gray-200 mt-6">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Kode Pesanan</th>
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Pelanggan</th>
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Tipe Transaksi</th>
                <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                <th className="border border-gray-200 px-4 py-3 text-right text-sm font-semibold text-gray-700">Total</th>
                <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pesanan.length === 0 ? (
                <tr>
                  <td colSpan="6" className="border border-gray-200 px-4 py-8 text-center text-gray-500">
                    Belum ada data pesanan
                  </td>
                </tr>
              ) : (
                pesanan.map((item, index) => (
                  <tr key={item.transaction_id} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">{item.transaction_code || '-'}</td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">
                      <span className={!item.customer_name ? 'text-blue-600 font-medium' : ''}>
                        {getCustomerLabel(item, index)}
                      </span>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">
                      {item.payment_method === 'DIGITAL' || item.payment_method === 'QRIS' ? 'Online' : 'Offline'}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status || '-'}
                      </span>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                      {item.final_amount ? `Rp${Number(item.final_amount).toLocaleString()}` : '-'}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-center">
                      <div className="flex space-x-2 justify-center">
                        <button 
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded bg-blue-100 hover:bg-blue-200 transition" 
                          onClick={() => navigate(`/admin/pesanan/${item.transaction_id}`)}
                        >
                          Detail
                        </button>
                        <button 
                          className="text-green-600 hover:text-green-800 text-sm font-medium px-3 py-1 rounded bg-green-100 hover:bg-green-200 transition" 
                          onClick={() => handleUpdateOrder(item)}
                        >
                          Update
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {/* Update Modal */}
        {showUpdateModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">Update Pesanan #{selectedOrder.transaction_code}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status Pesanan</label>
                  <select
                    value={updateData.status}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih Status</option>
                    <option value="menunggu pembayaran">Menunggu Pembayaran</option>
                    <option value="diproses">Diproses</option>
                    <option value="dikirim">Dikirim</option>
                    <option value="selesai">Selesai</option>
                    <option value="dibatalkan">Dibatalkan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Resi</label>
                  <input
                    type="text"
                    placeholder="Masukkan nomor resi"
                    value={updateData.waybill_number}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, waybill_number: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kurir</label>
                  <select
                    value={updateData.courier}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, courier: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih Kurir</option>
                    <option value="jne">JNE</option>
                    <option value="pos">POS Indonesia</option>
                    <option value="tiki">TIKI</option>
                    <option value="sicepat">SiCepat</option>
                    <option value="jnt">J&T Express</option>
                    <option value="ninja">Ninja Express</option>
                    <option value="lion">Lion Parcel</option>
                    <option value="pcp">PCP Express</option>
                    <option value="jet">JET Express</option>
                    <option value="rex">REX Express</option>
                    <option value="first">First Logistics</option>
                    <option value="ide">ID Express</option>
                    <option value="sap">SAP Express</option>
                    <option value="jessel">Jessel Express</option>
                    <option value="rpx">RPX Holding</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleSubmitUpdate}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Update Pesanan
                </button>
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Detail Pesanan */}
        {selectedOrder && !showUpdateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" onClick={() => setSelectedOrder(null)}>
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-4">Detail Pesanan</h3>
              <div className="mb-2"><b>Kode Pesanan:</b> {selectedOrder.transaction_code}</div>
              <div className="mb-2"><b>Pelanggan:</b> {selectedOrder.customer_name || 'Pelanggan Offline'}</div>
              <div className="mb-2"><b>Ditangani Oleh:</b> {selectedOrder.transaction_handler || 'Admin'}</div>
              <div className="mb-2"><b>Status:</b> {selectedOrder.status || '-'}</div>
              <div className="mb-2"><b>Total:</b> Rp{Number(selectedOrder.final_amount || 0).toLocaleString()}</div>
              {selectedOrder.waybill_number && (
                <div className="mb-2"><b>Resi:</b> {selectedOrder.waybill_number}</div>
              )}
              {selectedOrder.courier && (
                <div className="mb-2"><b>Kurir:</b> {selectedOrder.courier}</div>
              )}
              <div className="mb-2"><b>Tanggal:</b> {new Date(selectedOrder.created_at).toLocaleDateString('id-ID')}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KelolaPesanan; 