import React, { useEffect, useState } from "react";
import api from "../../utils/api";

const KelolaPesanan = () => {
  const [pesanan, setPesanan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchPesanan = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/transactions");
        setPesanan(res.data);
      } catch {
        setError("Gagal mengambil data pesanan");
      }
      setLoading(false);
    };
    fetchPesanan();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 flex-1">
      <div className="bg-white rounded-xl shadow p-8">
        <h2 className="text-3xl font-bold mb-6">Kelola Pesanan</h2>
        {error && <div className="text-red-600 text-center font-semibold mb-4">{error}</div>}
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <table className="w-full mb-6">
            <thead>
              <tr>
                <th>Kode Pesanan</th>
                <th>Pelanggan</th>
                <th>Status</th>
                <th>Total</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pesanan.map((p) => (
                <tr key={p.transaction_id}>
                  <td>{p.transaction_code}</td>
                  <td>{p.customer_name}</td>
                  <td>{p.payment_status}</td>
                  <td>Rp{Number(p.total_amount).toLocaleString()}</td>
                  <td><button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => setSelectedOrder(p)}>Detail</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {/* Modal Detail Pesanan */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" onClick={() => setSelectedOrder(null)}>
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-4">Detail Pesanan</h3>
              <div className="mb-2"><b>Kode Pesanan:</b> {selectedOrder.transaction_code}</div>
              <div className="mb-2"><b>Pelanggan:</b> {selectedOrder.customer_name}</div>
              <div className="mb-2"><b>Status:</b> {selectedOrder.payment_status}</div>
              <div className="mb-2"><b>Total:</b> Rp{Number(selectedOrder.total_amount).toLocaleString()}</div>
              <div className="mb-2"><b>Catatan:</b> {selectedOrder.notes || '-'}</div>
              <button className="mt-6 bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition" onClick={() => setSelectedOrder(null)}>Tutup</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KelolaPesanan; 